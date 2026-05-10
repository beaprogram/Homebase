with source as (
    select * from {{ source('transactional', 'transit_stops') }}
)

select
    id          as stop_id,
    stop_name,
    latitude,
    longitude,
    route_type
from source
where stop_name is not null
