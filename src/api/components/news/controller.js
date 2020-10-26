const newStore = require("./store");
const boom = require('@hapi/boom');
const Axios = require('axios');
const { URL_SCRAPPER } = process.env;


const getAllNews = async (page) => {
    const news = await newStore.getAllNews(page);
    return news;
}

const getOneNew = async (id) => {
    const mNew = await newStore.getOneById(id);
    if (!mNew) throw boom.badRequest('That new doesnt exists! 👽');
    return mNew;
}

const addNew = async (title, subtitle, articleDate, imageUrl, category, body, articleUrl, journal, scrappingDate, sentiment, userData) => {
    if (!userData.isAdmin) throw boom.unauthorized("Sorry! but only admins can create news 😞😔😔😔😞");
    const newspaperArticle = {
        title,
        subtitle,
        articleDate,
        imageUrl,
        category,
        body,
        articleUrl,
        journal,
        scrappingDate,
        sentiment
    }
    const newsPaperAdded = await newStore.createNews(newspaperArticle);
    return newsPaperAdded;
}

const deleteNew = async (id, userData) => {
    if (userData.isAdmin) {
        const deleted = await newStore.deleteNew(id);
        if (!deleted) boom.notFound("New not found");
        return deleted;
    } else {
        throw boom.unauthorized("Sorry! you cant made that action! 🔬");
    }
}

const specialRoute = async () => {
    let parsedNews = [];
    let date = new Date().toLocaleDateString("en-US", {timeZone: 'America/Mexico_city'});
    let [month, day, year] = date.split('/')
    const finalUrl = URL_SCRAPPER + "articles-joined/" + `${year}-${month}-${day}`;
    console.log(finalUrl)    


    try {
        const response = await Axios.get(finalUrl);
        const myArray = response.data;
        myArray.forEach(element => {
            const myNew = {
                title: element.title.replace(/(\n){1,}/g, ""),
                subTitle: element.subtitle.replace(/(\n){1,}/g, ""),
                articleDate: element.article_date,
                imageUrl: element.image_url,
                category: element.category,
                body: element.body.replace(/(\n){1,}/g, ""),
                articleUrl: element.article_url,
                journal: element.journal,
                scrappingDate: element.scraping_date,
                sentiment: element.sentiment_classification
            }
            parsedNews.push(myNew);
        });
        await newStore.multipleInserts(parsedNews);
    } catch (error) {
        if (error) throw error
    }    
}

const getNewsByCategory = async (category, page) => {
    let filter = {
        category
    }
    return await newStore.findByFilter(filter, page);
}

const makeSearch = async (qry, page) => {
    const docs = await newStore.searchNews(qry, page);
    if(docs.length === 0) {
        throw boom.badRequest('News not found 😔');
    } else {
        return docs
    }
}

module.exports = {
    getAllNews,
    addNew,
    deleteNew,
    specialRoute,
    getOneNew,
    getNewsByCategory,
    makeSearch
}