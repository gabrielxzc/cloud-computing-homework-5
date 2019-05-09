from flask import Flask

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
