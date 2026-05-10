with source as (
    select * from {{ source('transactional', 'listings') }}
),

cleaned as (
    select
        id                                          as listing_id,
        title,
        description,
        address,
        neighbourhood,
        cast(price as numeric(12, 2))               as price,
        bedrooms,
        cast(bathrooms as numeric(3, 1))             as bathrooms,
        sqft,
        upper(type)                                  as listing_type,
        cast(latitude as numeric(10, 7))             as latitude,
        cast(longitude as numeric(10, 7))            as longitude,
        source,
        external_id,
        image_url,
        created_at,
        updated_at
    from source
    where title is not null
      and type in ('RENTAL', 'SALE')
      and price > 0
)

select * from cleaned
