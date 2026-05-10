with listings as (
    select * from {{ ref('stg_listings') }}
),

aggregated as (
    select
        neighbourhood,
        count(*)                                                        as listing_count,
        count(*) filter (where listing_type = 'RENTAL')                as rental_count,
        count(*) filter (where listing_type = 'SALE')                  as sale_count,
        avg(price) filter (where listing_type = 'RENTAL')              as avg_rental_price,
        avg(price) filter (where listing_type = 'SALE')                as avg_sale_price,
        min(price)                                                      as min_price,
        max(price)                                                      as max_price,
        max(updated_at)                                                 as last_updated
    from listings
    where neighbourhood is not null
    group by neighbourhood
)

select * from aggregated
