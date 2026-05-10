"""HomeBase — Analyst Dashboard (Streamlit)

Three pages:
  1. Market Overview   — median rent by neighbourhood, trends over time
  2. Pipeline Health   — data freshness, row counts, listing type breakdown
  3. Rent vs Buy       — affordability comparison across neighbourhoods

Run:
    streamlit run analytics/dashboard.py
"""

import os
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
import streamlit as st
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.environ.get("DATABASE_URL", "postgresql://homebase:homebase@localhost:5432/homebase")

st.set_page_config(
    page_title="HomeBase Analytics",
    page_icon="🏠",
    layout="wide",
    initial_sidebar_state="expanded",
)

# ── DB connection ──────────────────────────────────────────────────────────────

@st.cache_resource
def get_engine():
    return create_engine(DATABASE_URL)


@st.cache_data(ttl=300)
def query(sql: str, params: dict | None = None) -> pd.DataFrame:
    with get_engine().connect() as conn:
        return pd.read_sql(text(sql), conn, params=params)


# ── Sidebar navigation ─────────────────────────────────────────────────────────

st.sidebar.image("https://via.placeholder.com/200x60/2563eb/ffffff?text=HomeBase", use_column_width=True)
st.sidebar.title("HomeBase Analytics")
page = st.sidebar.radio(
    "Navigate",
    ["📊 Market Overview", "🔧 Pipeline Health", "💰 Rent vs Buy"],
    label_visibility="collapsed",
)
st.sidebar.markdown("---")
st.sidebar.caption("Data refreshed nightly via Prefect. Powered by dbt + PostgreSQL.")


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — Market Overview
# ═══════════════════════════════════════════════════════════════════════════════

if page == "📊 Market Overview":
    st.title("📊 Toronto Housing Market Overview")
    st.caption("Median rents and listing volume by neighbourhood — sourced from live listings data.")

    # ── KPI row ────────────────────────────────────────────────────────────────
    try:
        kpis = query("""
            SELECT
                count(*)                                                        AS total_listings,
                count(*) FILTER (WHERE type = 'RENTAL')                        AS rental_count,
                count(*) FILTER (WHERE type = 'SALE')                          AS sale_count,
                round(avg(price) FILTER (WHERE type = 'RENTAL'), 0)            AS avg_rent,
                round(avg(price) FILTER (WHERE type = 'SALE') / 1000, 0)       AS avg_sale_k,
                count(DISTINCT neighbourhood)                                   AS neighbourhoods
            FROM listings
        """)
        row = kpis.iloc[0]
        c1, c2, c3, c4, c5, c6 = st.columns(6)
        c1.metric("Total Listings", f"{int(row.total_listings):,}")
        c2.metric("Rentals", f"{int(row.rental_count):,}")
        c3.metric("For Sale", f"{int(row.sale_count):,}")
        c4.metric("Avg Rent / mo", f"${int(row.avg_rent):,}" if pd.notna(row.avg_rent) else "N/A")
        c5.metric("Avg Sale Price", f"${int(row.avg_sale_k):,}K" if pd.notna(row.avg_sale_k) else "N/A")
        c6.metric("Neighbourhoods", int(row.neighbourhoods))
    except Exception as e:
        st.error(f"Could not load KPIs: {e}")

    st.markdown("---")

    col_left, col_right = st.columns(2)

    # ── Median rent by neighbourhood ───────────────────────────────────────────
    with col_left:
        st.subheader("Median Rent by Neighbourhood")
        try:
            rent_df = query("""
                SELECT
                    neighbourhood,
                    round(percentile_cont(0.5) WITHIN GROUP (ORDER BY price), 0) AS median_rent,
                    count(*) AS listing_count
                FROM listings
                WHERE type = 'RENTAL' AND neighbourhood IS NOT NULL AND price > 0
                GROUP BY neighbourhood
                HAVING count(*) >= 1
                ORDER BY median_rent DESC
            """)
            if not rent_df.empty:
                fig = px.bar(
                    rent_df,
                    x="median_rent",
                    y="neighbourhood",
                    orientation="h",
                    color="median_rent",
                    color_continuous_scale="Blues",
                    labels={"median_rent": "Median Rent ($/mo)", "neighbourhood": ""},
                    text="median_rent",
                )
                fig.update_traces(texttemplate="$%{text:,.0f}", textposition="outside")
                fig.update_layout(
                    coloraxis_showscale=False,
                    height=420,
                    margin=dict(l=0, r=60, t=20, b=20),
                )
                st.plotly_chart(fig, use_container_width=True)
            else:
                st.info("No rental data yet. Run the ingestion pipeline to load listings.")
        except Exception as e:
            st.error(f"Query failed: {e}")

    # ── Listing mix by neighbourhood ───────────────────────────────────────────
    with col_right:
        st.subheader("Listing Mix by Neighbourhood")
        try:
            mix_df = query("""
                SELECT neighbourhood, type, count(*) AS cnt
                FROM listings
                WHERE neighbourhood IS NOT NULL
                GROUP BY neighbourhood, type
                ORDER BY neighbourhood, type
            """)
            if not mix_df.empty:
                pivot = mix_df.pivot_table(index="neighbourhood", columns="type", values="cnt", fill_value=0).reset_index()
                fig2 = px.bar(
                    mix_df,
                    x="cnt",
                    y="neighbourhood",
                    color="type",
                    orientation="h",
                    labels={"cnt": "Listings", "neighbourhood": "", "type": "Type"},
                    color_discrete_map={"RENTAL": "#2563eb", "SALE": "#16a34a"},
                    barmode="stack",
                )
                fig2.update_layout(height=420, margin=dict(l=0, r=20, t=20, b=20))
                st.plotly_chart(fig2, use_container_width=True)
        except Exception as e:
            st.error(f"Query failed: {e}")

    # ── Price distribution ─────────────────────────────────────────────────────
    st.subheader("Rental Price Distribution")
    try:
        dist_df = query("""
            SELECT price
            FROM listings
            WHERE type = 'RENTAL' AND price BETWEEN 500 AND 10000
        """)
        if not dist_df.empty:
            fig3 = px.histogram(
                dist_df, x="price", nbins=40,
                labels={"price": "Monthly Rent ($)", "count": "Listings"},
                color_discrete_sequence=["#2563eb"],
            )
            fig3.update_layout(height=280, margin=dict(l=0, r=0, t=20, b=20))
            st.plotly_chart(fig3, use_container_width=True)
    except Exception as e:
        st.error(f"Query failed: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — Pipeline Health
# ═══════════════════════════════════════════════════════════════════════════════

elif page == "🔧 Pipeline Health":
    st.title("🔧 Data Pipeline Health")
    st.caption("Freshness, row counts, and data quality checks from the nightly ingestion run.")

    col1, col2 = st.columns(2)

    with col1:
        st.subheader("Row Counts by Source")
        try:
            sources = query("""
                SELECT
                    coalesce(source, 'unknown')      AS source,
                    count(*)                         AS rows,
                    max(updated_at)                  AS last_updated,
                    count(*) FILTER (WHERE image_url IS NOT NULL) AS with_image,
                    count(*) FILTER (WHERE description IS NOT NULL AND length(description) > 20) AS with_desc
                FROM listings
                GROUP BY source
                ORDER BY rows DESC
            """)
            st.dataframe(
                sources.style.format({
                    "rows": "{:,}",
                    "with_image": "{:,}",
                    "with_desc": "{:,}",
                }),
                use_container_width=True,
                hide_index=True,
            )
        except Exception as e:
            st.error(f"Query failed: {e}")

    with col2:
        st.subheader("Data Freshness")
        try:
            freshness = query("""
                SELECT
                    max(updated_at)                              AS latest_update,
                    min(updated_at)                              AS oldest_record,
                    now() - max(updated_at)                      AS age,
                    count(*) FILTER (WHERE updated_at > now() - interval '24 hours') AS updated_24h,
                    count(*) FILTER (WHERE updated_at > now() - interval '7 days')   AS updated_7d
                FROM listings
            """)
            row = freshness.iloc[0]
            st.metric("Latest Update", str(row.latest_update)[:19] if pd.notna(row.latest_update) else "Never")
            st.metric("Updated in last 24h", f"{int(row.updated_24h):,}")
            st.metric("Updated in last 7d", f"{int(row.updated_7d):,}")
        except Exception as e:
            st.error(f"Query failed: {e}")

    st.markdown("---")
    st.subheader("Data Quality Checks")
    try:
        quality = query("""
            SELECT
                count(*)                                                AS total,
                count(*) FILTER (WHERE title IS NULL)                   AS missing_title,
                count(*) FILTER (WHERE price IS NULL OR price <= 0)    AS missing_price,
                count(*) FILTER (WHERE neighbourhood IS NULL)           AS missing_neighbourhood,
                count(*) FILTER (WHERE type NOT IN ('RENTAL','SALE'))  AS invalid_type,
                count(*) FILTER (WHERE bedrooms < 0)                   AS negative_bedrooms
            FROM listings
        """)
        row = quality.iloc[0]
        checks = {
            "Title populated": (int(row.missing_title) == 0, f"{int(row.missing_title)} missing"),
            "Price positive": (int(row.missing_price) == 0, f"{int(row.missing_price)} invalid"),
            "Neighbourhood set": (int(row.missing_neighbourhood) == 0, f"{int(row.missing_neighbourhood)} missing"),
            "Type valid": (int(row.invalid_type) == 0, f"{int(row.invalid_type)} invalid"),
            "Bedrooms non-negative": (int(row.negative_bedrooms) == 0, f"{int(row.negative_bedrooms)} invalid"),
        }
        c1, c2, c3 = st.columns(3)
        for i, (check, (passed, detail)) in enumerate(checks.items()):
            col = [c1, c2, c3][i % 3]
            col.metric(
                check,
                "✅ Pass" if passed else f"❌ Fail",
                detail,
                delta_color="normal" if passed else "inverse",
            )
    except Exception as e:
        st.error(f"Quality check failed: {e}")

    st.markdown("---")
    st.subheader("Recent Listings (last 10 ingested)")
    try:
        recent = query("""
            SELECT id, title, neighbourhood, price, type, source, updated_at::date AS date
            FROM listings
            ORDER BY updated_at DESC
            LIMIT 10
        """)
        st.dataframe(recent, use_container_width=True, hide_index=True)
    except Exception as e:
        st.error(f"Query failed: {e}")


# ═══════════════════════════════════════════════════════════════════════════════
# PAGE 3 — Rent vs Buy
# ═══════════════════════════════════════════════════════════════════════════════

elif page == "💰 Rent vs Buy":
    st.title("💰 Rent vs Buy Analysis")
    st.caption("Compare the cost of renting vs buying in each Toronto neighbourhood.")

    st.sidebar.markdown("### Calculator inputs")
    down_pct = st.sidebar.slider("Down payment %", 5, 40, 20)
    rate = st.sidebar.slider("Mortgage rate %", 3.0, 8.0, 5.5, 0.1)
    amort = st.sidebar.selectbox("Amortization (years)", [25, 20, 15, 30], index=0)
    years = st.sidebar.slider("Horizon (years)", 1, 30, 10)

    try:
        rvb = query("""
            SELECT
                neighbourhood,
                round(percentile_cont(0.5) WITHIN GROUP (ORDER BY price) FILTER (WHERE type = 'RENTAL'), 0) AS median_rent,
                round(percentile_cont(0.5) WITHIN GROUP (ORDER BY price) FILTER (WHERE type = 'SALE'), 0)   AS median_sale,
                count(*) FILTER (WHERE type = 'RENTAL')  AS rental_count,
                count(*) FILTER (WHERE type = 'SALE')    AS sale_count
            FROM listings
            WHERE neighbourhood IS NOT NULL
            GROUP BY neighbourhood
            HAVING count(*) FILTER (WHERE type = 'RENTAL') >= 1
               AND count(*) FILTER (WHERE type = 'SALE') >= 1
        """)

        if rvb.empty:
            st.info("Need both rental and for-sale listings to compare. Seed more data.")
        else:
            # Monthly mortgage payment formula
            r = (rate / 100) / 12
            n = amort * 12
            rvb["down"] = rvb["median_sale"] * (down_pct / 100)
            rvb["loan"] = rvb["median_sale"] - rvb["down"]
            rvb["monthly_mortgage"] = rvb["loan"] * (r * (1 + r) ** n) / ((1 + r) ** n - 1)
            rvb["monthly_mortgage"] = rvb["monthly_mortgage"].round(0)
            rvb["rent_premium"] = (rvb["monthly_mortgage"] - rvb["median_rent"]).round(0)
            rvb["breakeven_years"] = (rvb["down"] / (rvb["monthly_mortgage"] - rvb["median_rent"]) / 12).round(1)
            rvb["breakeven_years"] = rvb["breakeven_years"].clip(lower=0)

            # Summary table
            display = rvb[[
                "neighbourhood", "median_rent", "median_sale",
                "monthly_mortgage", "rent_premium", "breakeven_years"
            ]].copy()
            display.columns = [
                "Neighbourhood", "Med. Rent/mo", "Med. Sale Price",
                "Est. Mortgage/mo", "Mortgage – Rent", "Breakeven (yrs)"
            ]

            st.subheader(f"Buy vs Rent — {down_pct}% down, {rate}% rate, {amort}yr amort")
            st.dataframe(
                display.style.format({
                    "Med. Rent/mo": "${:,.0f}",
                    "Med. Sale Price": "${:,.0f}",
                    "Est. Mortgage/mo": "${:,.0f}",
                    "Mortgage – Rent": "${:+,.0f}",
                    "Breakeven (yrs)": "{:.1f}",
                }).background_gradient(subset=["Breakeven (yrs)"], cmap="RdYlGn_r"),
                use_container_width=True,
                hide_index=True,
            )

            st.markdown("---")
            col_a, col_b = st.columns(2)

            with col_a:
                st.subheader("Monthly Cost Comparison")
                melt = rvb.melt(
                    id_vars="neighbourhood",
                    value_vars=["median_rent", "monthly_mortgage"],
                    var_name="Type",
                    value_name="Monthly Cost",
                )
                melt["Type"] = melt["Type"].map({"median_rent": "Rent", "monthly_mortgage": "Mortgage"})
                fig4 = px.bar(
                    melt,
                    x="Monthly Cost",
                    y="neighbourhood",
                    color="Type",
                    barmode="group",
                    orientation="h",
                    color_discrete_map={"Rent": "#2563eb", "Mortgage": "#dc2626"},
                    labels={"neighbourhood": ""},
                )
                fig4.update_layout(height=380, margin=dict(l=0, r=20, t=10, b=20))
                st.plotly_chart(fig4, use_container_width=True)

            with col_b:
                st.subheader("Breakeven Timeline")
                rvb_sorted = rvb.sort_values("breakeven_years")
                fig5 = px.bar(
                    rvb_sorted,
                    x="breakeven_years",
                    y="neighbourhood",
                    orientation="h",
                    color="breakeven_years",
                    color_continuous_scale="RdYlGn_r",
                    labels={"breakeven_years": "Years to breakeven", "neighbourhood": ""},
                    text="breakeven_years",
                )
                fig5.update_traces(texttemplate="%{text:.1f}yr", textposition="outside")
                fig5.update_layout(coloraxis_showscale=False, height=380, margin=dict(l=0, r=60, t=10, b=20))
                st.plotly_chart(fig5, use_container_width=True)

            st.info(
                "**Methodology:** Breakeven = years until cumulative mortgage-vs-rent premium equals the down payment. "
                "Does not include property appreciation, maintenance, or transaction costs."
            )

    except Exception as e:
        st.error(f"Query failed: {e}")
