from flask import Flask
from flask import request
import pymongo
import os
import json
from azure.storage.blob import BlockBlobService
import uuid
import ssl
import json

app = Flask(__name__)


@app.route('/', methods=['GET'])
def get_index_page():
    return app.send_static_file('index.html')


@app.route('/submit', methods=['GET'])
def get_submit_page():
    return app.send_static_file('pages/submit.html')


@app.route('/reviews', methods=['GET'])
def get_reviews_page():
    return app.send_static_file('pages/reviews.html')


@app.route('/api/review', methods=['POST'])
def post_review():
    data = request.get_json()

    if 'text' in data:
        client = pymongo.MongoClient(os.getenv('CUSTOMCONNSTR_MONGOURL'))

        db = client['cloud-computing-homework-5-db']
        collection = db['reviews']

        collection.insert_one(data)

    elif 'audio' in data:
        block_blob_service = BlockBlobService(
            account_name='cch5blobstorage', account_key=os.getenv('BLOB_STORAGE_KEY'))
        container_name = 'review-audio-blobs'
        block_blob_service.create_blob_from_text(
            container_name, uuid.uuid1(), data['audio'])
    else:
        return '', 400

    return '', 201


def get_audio_blob(blob_name):
    try:
        block_blob_service = BlockBlobService(
            account_name='cch5blobstorage', account_key=os.getenv('BLOB_STORAGE_KEY'))
        container_name = 'review-audio-blobs'
        return block_blob_service.get_blob_to_text(container_name, blob_name).content
    except:
        return ""


@app.route('/api/reviews', methods=['GET'])
def get_reviews_content():

    client = pymongo.MongoClient(os.getenv("CUSTOMCONNSTR_MONGOURL"))

    db = client['cloud-computing-homework-5-db']
    collection = db['reviews']
    cursor = collection.find()

    results = []
    for elem in cursor:
        if "analysis" not in elem.keys():
            continue
        obj = {}
        obj["text"] = elem["text"]

        if "analysis" in elem.keys():
            obj["analysis"] = elem["analysis"]

        if "file-name" in elem.keys():
            obj["audio"] = get_audio_blob(
                elem["file-name"])
        results.append(json.dumps(obj))

    return json.dumps(results)
