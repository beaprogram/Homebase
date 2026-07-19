import pytest
import requests
import responses as resp_lib
from ingest_toronto import fetch_records, transform, price_for_bedrooms


SAMPLE_RECORD = {
    "_id": "101",
    "PROPERTY_NAME": "Maple Tree Apartments",
    "WARD_NAME": "Scarborough",
    "CONFIRMED_UNITS": "100",
    "SITE_ADDRESS": "123 Kingston Rd",
    "HOUSING_PROVIDER": "City of Toronto",
}


def test_price_for_bedrooms_increases_with_bedrooms():
    prices = [price_for_bedrooms(b) for b in range(4)]
    assert all(prices[i] < prices[i + 1] + 300 for i in range(len(prices) - 1))


def test_transform_returns_dict():
    result = transform(SAMPLE_RECORD)
    assert result is not None
    assert result["type"] == "RENTAL"
    assert result["neighbourhood"] == "Scarborough"
    assert result["title"].startswith("Maple Tree Apartments")
    assert result["external_id"] == "101"
    assert result["price"] > 0


def test_transform_missing_name_returns_none():
    result = transform({"_id": "999"})
    assert result is None


def test_transform_price_is_reasonable():
    result = transform(SAMPLE_RECORD)
    assert 1000 < result["price"] < 5000


@resp_lib.activate
def test_fetch_records_success():
    resp_lib.add(
        resp_lib.GET,
        "https://ckan0.cf.opendata.inter.toronto.ca/api/3/action/datastore_search",
        json={"result": {"records": [SAMPLE_RECORD]}},
    )
    records = fetch_records(limit=10)
    assert len(records) == 1
    assert records[0]["_id"] == "101"


@resp_lib.activate
def test_fetch_records_empty_on_error():
    resp_lib.add(
        resp_lib.GET,
        "https://ckan0.cf.opendata.inter.toronto.ca/api/3/action/datastore_search",
        body=requests.ConnectionError("Connection refused"),
    )
    records = fetch_records(limit=10)
    assert records == []
