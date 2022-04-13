import json
import boto3
import requests
import os

def lambda_handler(event, context):
    # TODO implement
    
    print("-----EVENT-----",event)
    query = event['queryStringParameters']['q']
    print(query)
    lex = boto3.client('lex-runtime')
    lex_resp = lex.post_text(
        botName = 'photo_album',
        botAlias = 'test',
        userId = 'user01',
        inputText = query)
    
    print(lex_resp)
    slots = lex_resp['slots']
    print(slots)
    keywords = [v for _, v in slots.items() if v]
    print(keywords)
    
    #Getting the JSON object into ElasticSearch
    endpoint = 'https://search-photos-cmexzfqg2n6qer6hzzmv3dqiya.us-east-1.es.amazonaws.com'
    awsauth = (os.environ['es_user'], os.environ['es_pass'])
    
    #OpenSearch domain endpoint with https://
    index = 'photos'
    type = 'Photos'
    url = endpoint + '/' + index + '/' + type + '/_search'
    print("URL --- {}".format(url))
    
    headers = { "Content-Type": "application/json" }
    
    result = []
    for i in keywords:
        
        print("keyword --- {}".format(i))
        
        query = {
            "query": {
                "match": {
                    "labels":i
                }
            }
        }
        
        req = requests.get(url, auth=awsauth, headers=headers, data=json.dumps(query))
        data = json.loads(req.content)
        
        print("----DATA----", data)
        
        for idx in data['hits']['hits']:
            key = idx['_source']['objectKey']
            url_res = "https://bass2.s3.amazonaws.com/"+key
            if(url_res not in result):
                result.append(url_res)
        print("-----RESULT-----",result)
    
    return {
        'statusCode': 200,
        'body': json.dumps(result),
        'headers':{
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS'
        }
    }