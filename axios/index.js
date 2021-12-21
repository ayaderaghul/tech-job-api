
const PORT = process.env.PORT || 8000
const express = require('express')
const axios = require('axios')
const cheerio = require('cheerio')

const app = express()

app.get('/', (req, res) => {
    res.json("welcome to my job api")
})

const jobboards = [
    // {
    //     name: 'linkedin',
    //     address: 'https://www.linkedin.com/jobs/search/',
    //     base: ''
    // },
    {
        name: 'berlin - engineering',
        address: 'https://berlinstartupjobs.com/engineering/',
        base: '',
        params: []
    },
    {
        name: 'berlin - product management',
        address: 'https://berlinstartupjobs.com/product-management/',
        base: '',
        params: []
    },
    {
        name: 'france - station f',
        address: 'https://jobs.stationf.co/search',
        base: '',
        params: [{'departments[0]': 'Tech'}]
    },
    {
        name: 'london',
        address: 'https://londonstartupjobs.co.uk/',
        base: '',
        params: {'s': 'software'}
    },
    {
        name: 'asia',
        address: 'https://startupjobs.asia/job/search',
        base: 'https://startupjobs.asia/',
        params: {'q': 'data'}
    },
    {
        name: 'startup.jobs',
        address: 'https://startup.jobs/',
        base: 'https://startup.jobs/',
        params: {'query': 'data',
            'places[query][0]': 'The Netherlands',
            'places[position]':'52.1326%2C5.29127'}
    },
    {
        name: 'remote',
        address: 'https://remote.co/remote-jobs/developer/',
        base: 'https://remote.co/',
        params: {}
    },
    {
        name: 'remote',
        address: 'https://remote.co/remote-jobs/it',
        base: 'https://remote.co/',
        params: {}
    },
    {
        name: 'remote',
        address: 'https://remote.co/remote-jobs/product-manager',
        base: 'https://remote.co/',
        params: {}
    }
]

const jobs = []
var content = []

jobboards.forEach(jobboard => {
    axios.get(jobboard.address, {params: jobboard.params})
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            if (jobboard.name.includes('berlin')) {
                console.log('berlin')
                $('div[class="bjs-jlid__wrapper"]', html).each(function() {
                    const url = $(this).find('div > div > div > h4 > a').attr('href')
                    const title = $(this).find('div > div > div > h4 > a').text()
                    const desc = $(this).find('div[class="bjs-jlid__description"]').text()
                    
                    axios.get(url)
                        .then(function(response){
                            const plainhtml = response.data
                        $('div[class="bsj-template__content"]', plainhtml).each(function(){
                            const paras = $(this).find('div > p').text().replace(/\r?\n|\r/g, " ")
                            const lists = $(this).find('div > ul').text().replace(/\r?\n|\r/g, " ")
                            content.push(paras+lists)
                        })
                    })
                    
                    
                    jobs.push({
                        title,
                        url: jobboard.base + url,
                        source: jobboard.name
                    })
                })
            } else if (jobboard.name.includes('london')){
                console.log('london')
                $('h2[class="product-listing-h2"]', html).each(function() {
                    const url = $(this).find('h2 > a').attr('href')
                    const title = $(this).text()

                    // axios.get(url)
                    //     .then(function(response){
                    //         const plainhtml = response.data
                    //     $('div[id="content"]', plainhtml).each(function(){
                    //         const paras = $(this).find('div > p').text().replace(/\r?\n|\r/g, " ")
                    //         const lists = $(this).find('div > ul').text().replace(/\r?\n|\r/g, " ")
                    //         content.push(paras+lists)
                    //     })
                    // })

                    jobs.push({
                        title,
                        url: jobboard.base + url,
                        source: jobboard.name
                    })
                })
            } else if (jobboard.name.includes('startup')){
                console.log('startup')
                $('a[class="postCard__title"]', html).each(function() {
                    const url = $(this).attr('href')
                    const title = $(this).text()
                    
                    axios.get(jobboard.base + url)
                        .then(function(response){
                            const plainhtml = response.data
                        $('div[id="trix-content"]', plainhtml).each(function(){
                            const paras = $(this).find('div > p').text().replace(/\r?\n|\r/g, " ")
                            const lists = $(this).find('div > ul').text().replace(/\r?\n|\r/g, " ")
                            content.push(paras+lists)
                        })
                    })

                    jobs.push({
                        title,
                        url: jobboard.base + url,
                        source: jobboard.name
                    })
                })
            // } else if (jobboard.name.includes('asia')){
            //     console.log('asia')
            //     $('div[class="suj-single-joblist-txt"]', html).each(function() {
            //         console.log('inside asia')
            //         const url = $(this).find('div > h5 > a').attr('href')
            //         const title = $(this).find('div > h5 > a').text()

            //         jobs.push({
            //             title,
            //             url: jobboard.base + url,
            //             source: jobboard.name
            //         })
            //     })
            } else if (jobboard.name.includes('remote')){
                console.log('remote')
                $('a[class="card m-0 border-left-0 border-right-0 border-top-0 border-bottom"]', html).each(function() {
                    const url = $(this).attr('href')
                    const title = $(this).find('span[class="font-weight-bold larger"]').text()

                    axios.get(jobboard.base + url)
                        .then(function(response){
                            const plainhtml = response.data
                        $('div[class="job_description"]', plainhtml).each(function(){
                            const paras = $(this).find('div > p').text().replace(/\r?\n|\r/g, " ")
                            const lists = $(this).find('div > ul').text().replace(/\r?\n|\r/g, " ")
                            content.push(paras+lists)
                        })
                    })

                    jobs.push({
                        title,
                        url: jobboard.base + url,
                        source: jobboard.name
                    })
                })
            }
        })
})

app.get('/jobs', (req, res) => {
    res.json(jobs)
})

app.get('/content', (req, res) => {
    res.json(content)
})

app.get('/jobs/:jobboardId', (req, res) => {
    const jobboardId = req.params.jobboardId
    const jobboardAddress = jobboards.filter(jobboard => jobboard.name == jobboardId)[0].address
    const jobboardBase = jobboards.filter(jobboard => jobboard.name == jobboardId)[0].base

    axios.get(jobboardAddress)
        .then(response => {
            const html = response.data
            const $ = cheerio.load(html)
            const specificJobs = []

            $('a', html).each(function (){
                const title = $(this).text()
                const url = $(this).attr('href')
                specificJobs.push({
                    title,
                    url: jobboardBase + url,
                    source: jobboardId
                })
                res.json(specificJobs)
            }).catch(err => console.log(err)) 
        })
})

app.listen(PORT, () => console.log(`server running on PORT ${PORT}`))
