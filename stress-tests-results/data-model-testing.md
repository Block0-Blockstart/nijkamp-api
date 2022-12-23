# Use Cases 

We perform a series of tests with different production chains in order to verify that the algorithm works as planned. 

The result of a query on a batchId should output 3 elements: the data from the batchId (chainMemberData), the places where that batchId came from (origin) and the places where the batchId went to (destination). 

Once a batch is passed to another member of the chain, the batch can be kept as it is, aggregated with more batches or separated into multiple sub batches. In all these cases the batch will receive a new ID. 

## Use Case #1 

In a production chain, a batch can be passed from one member to another, without aggregation or division. 

### Data  
 ```json 
{ "id": "0x01", "batchId": "B1", "origin": [], "destination": [  "0x02" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b8233011973e"}

{ "id": "0x02", "batchId": "B2", "origin": [  "B1" ], "destination": [  "0x03" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b8233011973f"}

{ "id": "0x03", "batchId": "B3", "origin": [  "B2" ], "destination": [], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119740"}
 ``` 
### Query Result for batchId: B2 
 ```json 
{
    "origin": [
        {
            "_id": "6385eb517553b8233011973e",
            "id": "0x01",
            "batchId": "B1",
            "origin": [],
            "destination": [
                "0x02"
            ],
            "data": {
                "numberChickens": 100
            }
        }
    ],
    "chainMemberData": {
        "_id": "6385eb517553b8233011973f",
        "id": "0x02",
        "batchId": "B2",
        "origin": [
            "B1"
        ],
        "destination": [
            "0x03"
        ],
        "data": {
            "numberChickens": 100
        }
    },
    "destinations": [
        {
            "_id": "6385eb517553b82330119740",
            "id": "0x03",
            "batchId": "B3",
            "origin": [
                "B2"
            ],
            "destination": [],
            "data": {
                "numberChickens": 100
            }
        }
    ]
}
 ``` 
## Use Case #2 

In a production chain, two batches can be aggregated into one batch. 

### Data  
 ```json 
{ "id": "0x01", "batchId": "B1", "origin": [], "destination": [  "0x03" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119741"}

{ "id": "0x02", "batchId": "B2", "origin": [], "destination": [  "0x03" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119742"}

{ "id": "0x03", "batchId": "B3", "origin": [  "B1",  "B2" ], "destination": [], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119743"}
 ``` 
### Query Result for batchId: B3 
 ```json 
{
    "origin": [
        {
            "_id": "6385eb517553b82330119741",
            "id": "0x01",
            "batchId": "B1",
            "origin": [],
            "destination": [
                "0x03"
            ],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b82330119742",
            "id": "0x02",
            "batchId": "B2",
            "origin": [],
            "destination": [
                "0x03"
            ],
            "data": {
                "numberChickens": 100
            }
        }
    ],
    "chainMemberData": {
        "_id": "6385eb517553b82330119743",
        "id": "0x03",
        "batchId": "B3",
        "origin": [
            "B1",
            "B2"
        ],
        "destination": [],
        "data": {
            "numberChickens": 100
        }
    },
    "destinations": []
}
 ``` 
## Use Case #3 

In a production chain, one batch can be separated into two batches. 

### Data  
 ```json 
{ "id": "0x01", "batchId": "B1", "origin": [], "destination": [  "0x02",  "0x03" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119744"}

{ "id": "0x02", "batchId": "B2", "origin": [  "B1" ], "destination": [], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119745"}

{ "id": "0x03", "batchId": "B3", "origin": [  "B1" ], "destination": [], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119746"}
 ``` 
### Query Result for batchId: B1 
 ```json 
{
    "origin": [],
    "chainMemberData": {
        "_id": "6385eb517553b82330119744",
        "id": "0x01",
        "batchId": "B1",
        "origin": [],
        "destination": [
            "0x02",
            "0x03"
        ],
        "data": {
            "numberChickens": 100
        }
    },
    "destinations": [
        {
            "_id": "6385eb517553b82330119745",
            "id": "0x02",
            "batchId": "B2",
            "origin": [
                "B1"
            ],
            "destination": [],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b82330119746",
            "id": "0x03",
            "batchId": "B3",
            "origin": [
                "B1"
            ],
            "destination": [],
            "data": {
                "numberChickens": 100
            }
        }
    ]
}
 ``` 
## Use Case #4 

In a production chain, a child batch can have the same destination as his parent batch. Here batch B3 is an aggregation of B2 and B1, but B2 also comes from B1. In this case we need to make sure that B3 is not duplicated in the destinations if we query on B1. 

### Data  
 ```json 
{ "id": "0x01", "batchId": "B1", "origin": [], "destination": [  "0x02",  "0x03" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119747"}

{ "id": "0x02", "batchId": "B2", "origin": [  "B1" ], "destination": [  "0x03" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119748"}

{ "id": "0x03", "batchId": "B3", "origin": [  "B1",  "B2" ], "destination": [], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119749"}
 ``` 
### Query Result for batchId: B1 
 ```json 
{
    "origin": [],
    "chainMemberData": {
        "_id": "6385eb517553b82330119747",
        "id": "0x01",
        "batchId": "B1",
        "origin": [],
        "destination": [
            "0x02",
            "0x03"
        ],
        "data": {
            "numberChickens": 100
        }
    },
    "destinations": [
        {
            "_id": "6385eb517553b82330119748",
            "id": "0x02",
            "batchId": "B2",
            "origin": [
                "B1"
            ],
            "destination": [
                "0x03"
            ],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b82330119749",
            "id": "0x03",
            "batchId": "B3",
            "origin": [
                "B1",
                "B2"
            ],
            "destination": [],
            "data": {
                "numberChickens": 100
            }
        }
    ]
}
 ``` 
## Use Case #5 

In a production chain, all the above cases can appear. 

### Data  
 ```json 
{ "id": "0x01", "batchId": "B1", "origin": [], "destination": [  "0x03" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b8233011974a"}

{ "id": "0x02", "batchId": "B2", "origin": [], "destination": [  "0x03" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b8233011974b"}

{ "id": "0x03", "batchId": "B3", "origin": [  "B1",  "B2" ], "destination": [  "0x05" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b8233011974c"}

{ "id": "0x04", "batchId": "B4", "origin": [], "destination": [  "0x05" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b8233011974d"}

{ "id": "0x05", "batchId": "B5", "origin": [  "B3",  "B4" ], "destination": [  "0x06",  "0x07" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b8233011974e"}

{ "id": "0x06", "batchId": "B6", "origin": [  "B5" ], "destination": [  "0x08" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b8233011974f"}

{ "id": "0x07", "batchId": "B7", "origin": [  "B5" ], "destination": [  "0x08",  "0x09",  "0x10" ], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119750"}

{ "id": "0x08", "batchId": "B8", "origin": [  "B6",  "B7" ], "destination": [], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119751"}

{ "id": "0x09", "batchId": "B9", "origin": [  "B7" ], "destination": [], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119752"}

{ "id": "0x10", "batchId": "B10", "origin": [  "B7" ], "destination": [], "data": {  "numberChickens": 100 }, "_id": "6385eb517553b82330119753"}
 ``` 
### Query Result for batchId: B5 
 ```json 
{
    "origin": [
        {
            "_id": "6385eb517553b8233011974c",
            "id": "0x03",
            "batchId": "B3",
            "origin": [
                "B1",
                "B2"
            ],
            "destination": [
                "0x05"
            ],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b8233011974d",
            "id": "0x04",
            "batchId": "B4",
            "origin": [],
            "destination": [
                "0x05"
            ],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b8233011974a",
            "id": "0x01",
            "batchId": "B1",
            "origin": [],
            "destination": [
                "0x03"
            ],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b8233011974b",
            "id": "0x02",
            "batchId": "B2",
            "origin": [],
            "destination": [
                "0x03"
            ],
            "data": {
                "numberChickens": 100
            }
        }
    ],
    "chainMemberData": {
        "_id": "6385eb517553b8233011974e",
        "id": "0x05",
        "batchId": "B5",
        "origin": [
            "B3",
            "B4"
        ],
        "destination": [
            "0x06",
            "0x07"
        ],
        "data": {
            "numberChickens": 100
        }
    },
    "destinations": [
        {
            "_id": "6385eb517553b8233011974f",
            "id": "0x06",
            "batchId": "B6",
            "origin": [
                "B5"
            ],
            "destination": [
                "0x08"
            ],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b82330119750",
            "id": "0x07",
            "batchId": "B7",
            "origin": [
                "B5"
            ],
            "destination": [
                "0x08",
                "0x09",
                "0x10"
            ],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b82330119751",
            "id": "0x08",
            "batchId": "B8",
            "origin": [
                "B6",
                "B7"
            ],
            "destination": [],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b82330119752",
            "id": "0x09",
            "batchId": "B9",
            "origin": [
                "B7"
            ],
            "destination": [],
            "data": {
                "numberChickens": 100
            }
        },
        {
            "_id": "6385eb517553b82330119753",
            "id": "0x10",
            "batchId": "B10",
            "origin": [
                "B7"
            ],
            "destination": [],
            "data": {
                "numberChickens": 100
            }
        }
    ]
}
 ``` 
