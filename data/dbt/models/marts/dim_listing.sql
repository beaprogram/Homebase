with stg as (
    select * from {{ ref('stg_listings') }}
)

select
    listing_id,
    title,
    description,
    address,
    neighbourhood,
    price,
    bedrooms,
    bathrooms,
    sqft,
    listing_type,
    latitude,
    longitude,
    source,
    image_url,
    created_at,
    updated_at,
    case
        when listing_type = 'RENTAL' and bedrooms = 0 then 'Studio'
        when listing_type = 'RENTAL' and bedrooms = 1 then '1-bedroom'
        when listing_type = 'RENTAL' and bedrooms = 2 then '2-bedroom'
        when listing_type = 'RENTAL' and bedrooms >= 3 then '3+-bedroom'
        else listing_type
    end as listing_category,
    case
        when listing_type = 'RENTAL' and price < 1500 then 'budget'
        when listing_type = 'RENTAL' and price < 2500 then 'mid-range'
        when listing_type = 'RENTAL' and price >= 2500 then 'premium'
        when listing_type = 'SALE' and price < 600000 then 'budget'
        when listing_type = 'SALE' and price < 1200000 then 'mid-range'
        else 'premium'
    end as price_tier
from stg
