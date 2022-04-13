import os
import json
import boto3
import requests

def lambda_handler(event, context):
    # TODO implement
    
    #Deleting the JSON object from ElasticSearch
    endpoint = 'https://search-photos-cmexzfqg2n6qer6hzzmv3dqiya.us-east-1.es.amazonaws.com'
    awsauth = (os.environ['es_user'], os.environ['es_pass'])
    
    #OpenSearch domain endpoint with https://
    index = 'photos'
    type = 'Photos'
    url = endpoint + '/' + index + '/' + type + '/_delete_by_query'
    print("URL --- {}".format(url))
    headers = { "Content-Type": "application/json" }
    
    query = {
            "query": {
                "match_all": {
                }
            }
            }
    req = requests.post(url, auth=awsauth, headers=headers, data=json.dumps(query))
    data = json.loads(req.content)
    print("----DATA----", data)
    
    
    
    return {
        'statusCode': 200,
        'body': json.dumps(data)
    }