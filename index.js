const express = require('express')
const lodash = require('lodash');
const axios = require('axios');
const app = express();
const port = 5000;
const cachePeriod = 10000;



function blogsContainingSubstr(blogs, str)
{
    return lodash.filter(blogs, (blog)=>{
        return lodash.includes(blog.title.toLowerCase(), str.toLowerCase())
    });
}

function numberOfBlogsContainingSubstring(blogs, str)
{
    const count = lodash.size(blogsContainingSubstr(blogs, str));
    return count;
}

function uniqueBlogTitles(blogs)
{
    const titles = lodash.map(blogs, 'title');
    const uniqueTitles = lodash.uniq(titles);
    return uniqueTitles;
}

function blogCount(blogs)
{
    return lodash.size(blogs);
}

function blogWithLongestTitle(blogs)
{
    return lodash.maxBy(blogs, function(blog) {
        return blog.title.length;
    });
}

const memoizedStats = lodash.memoize(blogStats, (data)=>JSON.stringify(data), {
    maxAge: cachePeriod, 
})

const memoizedSearch = lodash.memoize(blogSearch, (data)=>JSON.stringify(data), {
    maxAge: cachePeriod, 
})

async function blogStats(){

    const customHeaders = {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
    };
    
    const apiresponse = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        headers: customHeaders, 
    });
    
    const blogs = apiresponse.data.blogs;
    return ({
        "totalNumberOfBlogs": blogCount(blogs), 
        "theTitleOfTheLongestBlog": blogWithLongestTitle(blogs).title, 
        "numberOfBlogsWithPrivacyInTheTitle": numberOfBlogsContainingSubstring(blogs, "privacy"), 
        "ArrayOfUniqueBlogTitles": uniqueBlogTitles(blogs)
    });
}    

async function blogSearch(param) {
    const customHeaders = {
        'x-hasura-admin-secret': '32qR4KmXOIpsGPQKMqEJHGJS27G5s7HdSKO3gdtQd2kv5e852SiYwWNfxkZOBuQ6',
    };
    
    const apiresponse = await axios.get('https://intent-kit-16.hasura.app/api/rest/blogs', {
        headers: customHeaders, 
    });
    
    const blogs = apiresponse.data.blogs;
    
    return ({
        "Blogs": blogsContainingSubstr(blogs, param), 
    });

}

app.get('/api/blog-stats', async (req, res)=>{
    try
    {
        res.json(await memoizedStats());
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
    }
});

app.get('/api/blog-search', async (req, res)=>{
    try
    {
        const param = req.query.query;
        res.json(await memoizedSearch(param));
    }
    catch(err){
        console.log(err);
        res.status(500).json({ error: 'An error occurred' });
    }

});

app.listen(port, () => {
  console.log(`listening on port ${port}`)
});