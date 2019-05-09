from flask import Flask
from flask import request
import pymongo
import os
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
        client = pymongo.MongoClient(os.getenv("CUSTOMCONNSTR_MONGOURL"))

        db = client['cloud-computing-homework-5-db']
        collection = db['reviews']

        collection.insert_one(data)
    elif 'audio' in data:
        pass
    else:
        return '', 400

    return '', 201
