from flask import Flask
from flask import request
import pymongo
import os
import json
from azure.storage.blob import BlockBlobService
import uuid
import ssl
import json
import base64
import azure.cognitiveservices.speech as speechsdk
import http.client, urllib.request, urllib.error, base64, json, ssl

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


def get_speech_to_text(blob_id):
    block_blob_service = BlockBlobService(account_name = 'cch5blobstorage', account_key = 'fQUKPyg1mEQEMatdm3FO55wItisgBrlRJ7olQzIFgCyx6TjxKrPEcC7Yn7PQ6bRANn9mLpMAAZRCCAGhU/MuPA==') 
    container_name = 'review-audio-blobs'

    print("\nDownloading blob to wav_file.wav")
    block_blob_service.get_blob_to_path(container_name, blob_id, "wav_file.wav")
    

    speech_key, service_region = "9d029bf416044e47b76939a0dc854001", "westus"
    speech_config = speechsdk.SpeechConfig(subscription=speech_key, region=service_region)

    audio_config = speechsdk.audio.AudioConfig(filename="wav_file.wav")
    speech_recognizer = speechsdk.SpeechRecognizer(speech_config=speech_config, audio_config=audio_config)

    result = speech_recognizer.recognize_once()

    # Checks result.
    if result.reason == speechsdk.ResultReason.RecognizedSpeech:
        return result.text
    elif result.reason == speechsdk.ResultReason.NoMatch:
        return "No speech could be recognized"
    elif result.reason == speechsdk.ResultReason.Canceled:
        return "Speech Recognition canceled"
    

def get_emo(text):
    ssl._create_default_https_context = ssl._create_unverified_context

    headers = {
        # Request headers
        'Content-Type': 'application/json',
        'Ocp-Apim-Subscription-Key': '61cd15583f6345de92bae159caa9acf8',
    }

    try:
        conn = http.client.HTTPSConnection('westcentralus.api.cognitive.microsoft.com')
        obj = {"documents":[ {"language": "en", "id": "1", "text": text }, ] }
        conn.request("POST", "/text/analytics/v2.1/sentiment?showStats=false", json.dumps(obj), headers)
        response = conn.getresponse()
        data = json.loads(response.read().decode("UTF-8"))
        if data["documents"][0]["score"] < 0.4:
            return "negative"
        elif data["documents"][0]["score"] < 0.6:
            return "neutral"
        return "positive"
    # conn.close()
    except Exception as e:
        print(str(e))
        return "unidentified"



@app.route('/api/review', methods=['POST'])
def post_review():
    data = request.get_json()

    if 'text' in data:
        data["emo"] = get_emo(data["text"])
        client = pymongo.MongoClient(os.getenv('CUSTOMCONNSTR_MONGOURL'))

        db = client['cloud-computing-homework-5-db']
        collection = db['reviews']
        
        collection.insert_one(data)
        

    elif 'audio' in data:
        block_blob_service = BlockBlobService(
            account_name='cch5blobstorage', account_key=os.getenv('BLOB_STORAGE_KEY'))
        container_name = 'review-audio-blobs'
        blob_id = uuid.uuid1()
        block_blob_service.create_blob_from_text(
            container_name, blob_id, data['audio'])
        # print(get_speech_to_text(blob_id))
    else:
        return '', 400

    return '', 201


def get_audio_blob(blob_name):
    try:
        block_blob_service = BlockBlobService(
            account_name='cch5blobstorage', account_key= os.getenv('BLOB_STORAGE_KEY'))
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
