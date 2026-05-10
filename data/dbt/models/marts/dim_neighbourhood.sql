with stg as (
    select * from {{ ref('stg_neighbourhoods') }}
)

select
    neighbourhood,
    listing_count,
    rental_count,
    sale_count,
    round(cast(avg_rental_price as numeric), 0) as avg_rental_price,
    round(cast(avg_sale_price as numeric), 0)   as avg_sale_price,
    round(cast(min_price as numeric), 0)         as min_price,
    round(cast(max_price as numeric), 0)         as max_price,
    last_updated,
    case
        when avg_rental_price < 1800 then 'affordable'
        when avg_rental_price < 2500 then 'moderate'
        else 'expensive'
    end as affordability_tier
from stg
