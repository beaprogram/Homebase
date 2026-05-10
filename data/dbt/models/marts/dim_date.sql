with date_spine as (
    select
        generate_series(
            '2024-01-01'::date,
            current_date + interval '1 year',
            '1 day'::interval
        )::date as date_day
)

select
    date_day,
    extract(year from date_day)::int          as year,
    extract(month from date_day)::int         as month,
    extract(quarter from date_day)::int       as quarter,
    extract(week from date_day)::int          as week_of_year,
    extract(dow from date_day)::int           as day_of_week,
    to_char(date_day, 'Day')                  as day_name,
    to_char(date_day, 'Month')                as month_name,
    extract(dow from date_day) in (0, 6)      as is_weekend,
    date_trunc('month', date_day)::date       as first_day_of_month,
    date_trunc('quarter', date_day)::date     as first_day_of_quarter
from date_spine
