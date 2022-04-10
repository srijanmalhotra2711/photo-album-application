import json
import boto3
import os
import requests
from datetime import *

def lambda_handler(event, context):
    print("EVENT ---- {}".format(json.dumps(event)))
    
    headers = {"Content-Type": "application/json"}
    
    s3 = boto3.client('s3')
    rek = boto3.client('rekognition')
    
    #Getting Image information from S3
    for record in event['Records']:
        bucket = record['s3']['bucket']['name']
        key = record['s3']['object']['key']
        size = record['s3']['object']['size']
        metadata = s3.head_object(Bucket=bucket, Key=key)
        
        #Detecting the label of the current image
        labels = rek.detect_labels(
            Image={
                'S3Object': {
                    'Bucket': bucket,
                    'Name': key
                }
            },
            MaxLabels=10
        )
        
        print("IMAGE LABELS---- {}".format(labels['Labels']))
        print("META DATA---- {}".format(metadata))
        
        if metadata["Metadata"]:
            customlabels = (metadata["Metadata"]["customlabels"]).split(",")
        
        #Prepare JSON object
        obj = {}
        obj['objectKey'] = key
        obj['bucket'] = bucket
        obj['createdTimestamp'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        obj['labels'] = []
        
        for label in labels['Labels']:
            obj['labels'].append(label['Name'])
            
        if metadata["Metadata"]:
            for c_labels in customlabels:
                c_labels = c_labels.strip()
                c_labels = c_labels.lower()
                if c_labels not in obj['labels']:
                    obj['labels'].append(c_labels)
                    
        print("FINAL LABELS -> ", obj['labels'])  #appends custom labels to final labels
            
        print("JSON OBJECT --- {}".format(obj))
        
        #Posting the JSON object into ElasticSearch, _id is automatically increased
        endpoint = 'https://search-photos-cmexzfqg2n6qer6hzzmv3dqiya.us-east-1.es.amazonaws.com'
        awsauth = (os.environ['es_user'], os.environ['es_pass'])
        
        #OpenSearch domain endpoint with https://
        index = 'photos'
        type = 'Photos'
        url = endpoint + '/' + index + '/' + type
        print("URL --- {}".format(url))
        
        obj = json.dumps(obj).encode("utf-8")
        req = requests.post(url, auth=awsauth, headers=headers, data=obj)
        
        print("Success: ", req)
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Headers': 'x-amz-meta-customlabels,Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
                'Access-Control-Allow-Origin': 'http://photoalbumass2.s3-website-us-east-1.amazonaws.com',
                'Access-Control-Allow-Methods': 'OPTIONS,POST,GET,PUT'
            },
            'body': json.dumps("Image labels have been detected successfully!")
        }