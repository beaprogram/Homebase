with listings as (
    select * from {{ ref('dim_listing') }}
),

daily as (
    select
        current_date                                         as snapshot_date,
        neighbourhood,
        listing_type,
        count(*)                                             as listing_count,
        round(avg(price)::numeric, 0)                       as avg_price,
        round(median(price::numeric)::numeric, 0)           as median_price,
        min(price)                                           as min_price,
        max(price)                                           as max_price,
        round(avg(bedrooms)::numeric, 1)                    as avg_bedrooms,
        sum(case when price_tier = 'budget' then 1 else 0 end)     as budget_count,
        sum(case when price_tier = 'mid-range' then 1 else 0 end)  as midrange_count,
        sum(case when price_tier = 'premium' then 1 else 0 end)    as premium_count
    from listings
    where neighbourhood is not null
    group by neighbourhood, listing_type
)

select * from daily
