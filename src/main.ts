const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const axios = require('axios');

const slackWebHook = 'https://hooks.slack.com/services/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';

interface VideoInfo {
    title: string;
    description: string;
    views: string;
    channelName: string;
}

const getHtml = async (searchText: string): Promise<string> => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(`https://www.youtube.com/results?search_query=${searchText}`);
    const html = await page.content();
    await browser.close();

    return html;
}

const getVideoInfo = (video): VideoInfo => {
    const videoInfoContainer = video;
    const title = videoInfoContainer.find('#video-title').text().trim();
    const description = videoInfoContainer.find('div.metadata-snippet-container > yt-formatted-string').text();
    const views = videoInfoContainer.find('#metadata-line > span:nth-child(2)').text();
    const channelName = videoInfoContainer.find('#channel-info ytd-channel-name yt-formatted-string').text();

    return {
        title: title,
        description: description,
        views: views,
        channelName: channelName
    }
}

const getVideos = ($): VideoInfo[] => {
    const videos = $('#contents > ytd-video-renderer');
    const result = videos.map((_, video) => getVideoInfo($(video))).toArray();

    return result;
}

const main = async (searchText: string) => {
    const html = await getHtml(searchText);
    const $ = cheerio.load(html);

    const result = getVideos($);

    axios.post(slackWebHook, {'text': JSON.stringify(result)});
    console.log(result)
}

main('fulcrum');
