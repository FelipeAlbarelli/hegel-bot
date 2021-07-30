require('dotenv').config();
import { parse } from 'node-html-parser';
import axios from 'axios'
import random from 'random';
import Twitter from 'twitter-v2';
import TwitterApi from 'twitter-api-v2';
import Twit from 'twit';
import _ from 'lodash';
import {TwitThread} from 'twit-thread'


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

const config = {
    consumer_key: api_key,
    consumer_secret: api_secret,
    access_token,
    access_token_secret,
}

const twitThread = new TwitThread(config);

const postRandomTwit = () => {
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
        const textToPost = chosenParagraph.text
        // const textToPost = '“Hegel’s dialectics” refers to the particular dialectical method of argument employed by the 19th Century German philosopher, G.W.F. Hegel (see entry on Hegel), which, like other “dialectical” methods, relies on a contradictory process between opposing sides. Whereas Plato’s “opposing sides” were people (Socrates and his interlocutors), however, what the “opposing sides” are in Hegel’s work depends on the subject matter he discusses. In his work on logic, for instance, the “opposing sides” are different definitions of logical concepts that are opposed to one another. In the Phenomenology of Spirit, which presents Hegel’s epistemology or philosophy of knowledge, the “opposing sides” are different definitions of consciousness and of the object that consciousness is aware of or claims to know. As in Plato’s dialogues, a contradictory process between “opposing sides” in Hegel’s dialectics leads to a linear evolution or development from less sophisticated definitions or views to more sophisticated ones later. The dialectical process thus constitutes Hegel’s method for arguing against the earlier, less sophisticated definitions or views and for the more sophisticated ones later. Hegel regarded this dialectical method or “speculative mode of cognition” (PR §10) as the hallmark of his philosophy and used the same method in the Phenomenology of Spirit [PhG], as well as in all of the mature works he published later—the entire Encyclopaedia of Philosophical Sciences (including, as its first part, the “Lesser Logic” or the Encyclopaedia Logic [EL]), the Science of Logic [SL], and the Philosophy of Right [PR].'
        // return tweeterClient.v2.tweets(textToPost);
    
        // return client.post('statuses/update.json', {status: textToPost})
        const textChuncks = _.chunk(textToPost , 240).map( stringArray => stringArray.filter( i => i !== `\n`).join('') )
        console.log(textChuncks.length)
        return twitThread.tweetThread(
            textChuncks.map(
                (text , i) => ({
                    text : text + `[${i+1}/${textChuncks.length}]`
                })
            )
        )
    
        // let id = '';
        // for (const [ i , text] of textChuncks.entries()) {
        //     const last = i === textChuncks.length - 1;
        //     const first = id === '';
        //     const status = text + (last ? `...` : '[q.e.d]')
        //     bot.post('statuses/update' , first ? {status} : {status , in_reply_to_status_id : id} , (err , data , res) => {
        //         if (err) {
        //             console.log(err)
        //             return;
        //         }
        //         console.log('postado :D' , id)
        //         id =`${data.id}`;
        //     })
            
        // }
    } ).then((x) => {
        console.log('postado');
    }).catch(err => {
        console.log(err);
    })
}

setInterval( () => {
    console.log('chama função');
    postRandomTwit();
} , 1000 * 60 * 60);