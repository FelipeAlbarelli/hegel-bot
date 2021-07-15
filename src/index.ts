require('dotenv').config();
import { parse } from 'node-html-parser';
import axios from 'axios'
import random from 'random';
import Twitter from 'twitter-v2';
import TwitterApi from 'twitter-api-v2';
import Twit from 'twit';


const choseRandom = <T>(x : T[]  ) => {
    return x[random.int(0 , x.length - 1)]
}

const { api_key , api_secret , bearer_token , access_token , access_token_secret } = process.env;
if (! ( api_key || api_secret || bearer_token || access_token || access_token_secret ) ) {
    console.log({ api_key , api_secret , bearer_token })
    throw new Error(`não carregou algum token`)
}

const client = new Twitter({
    consumer_key: api_key , 
    consumer_secret : api_secret,
    access_token_key : access_token , 
    access_token_secret : access_token_secret
})

const tweeterClient = new TwitterApi({
    appKey : api_key ,
    appSecret : api_secret
})

const bot = new Twit({
    consumer_key : api_key,
    consumer_secret : api_secret,
    access_token,
    access_token_secret,
    timeout_ms : 60 * 1000
})

tweeterClient.appLogin().then(() => {
    return axios.get('https://plato.stanford.edu/search/searcher.py?query=hegel')
}).then( data => {
    console.log(data.status);
    const root = parse(data.data);
    const htmlLinks = root.querySelectorAll('.l')
    const links = htmlLinks.map( htmlElement => htmlElement.getAttribute('href') )
// escolher link aleatório
    const chosenLink = choseRandom(links);
    console.log(chosenLink);
    return axios.get(chosenLink)
} ).then( resonse => {
    console.log(resonse.status);
    const root = parse(resonse.data);
    const mainTextHtml = root.querySelector('#main-text');
    const paragraphs = mainTextHtml.querySelectorAll('p');
    const chosenParagraph = choseRandom(paragraphs);
    // console.log(chosenParagraph.text)
    const textToPost = chosenParagraph.text.length > 280 ? chosenParagraph.text.slice(0 , 270) + '...' : chosenParagraph.text;
    // return tweeterClient.v1.tweet(textToPost);

    // return client.post('statuses/update.json', {status: textToPost})
    bot.post('statuses/update' , {status : textToPost } , (err , data , res) => {
        if (err) {
            console.log(err)
            return;
        }
        console.log('postado :D')
        console.log(textToPost);
    })
// } ).then((x) => {
    // console.log('postado');
}).catch(err => {
    console.log(err);
})