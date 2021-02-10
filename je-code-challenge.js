/*
 *  JavaScript Code Challenge
 *  Josiah Eakle | February 9, 2021
 * 
 *  Uses
 *  The Cat Api - {https://docs.thecatapi.com/} 
 * 
 *  Requirements 
 *  1. Build a JS class that will handle requests to the API
 *  2. Make a request for the list of cat breeds
 *  3. Iterate through those breeds creating a link for each breed displaying the name
 *  4. When the link is clicked (see above) make a request for images for that breed (limit 5 per page)
 *  5. Display the images to the user with Next and Previous buttons that will load the next/previous page.
 * 
 *  MY API KEY - 582125ca-20b5-46cd-941d-f697028cbb06
 * 
 */

class Breed {

    /**
     * Object to handle data about individual breeds.
     * @param {string} name        Name of breed
     * @param {string} id          API ID set by The Cat Api
     * @param {string} description Description of breed
     * @param {number} pageAmount  Amount of image pages for breed, not required
     */

    constructor(name, id, description, pageAmount) {
        this.name = name;
        this.id = id;
        this.description = description;
        this.pageAmount = pageAmount || undefined;
    }

}

class ApiHandler {

    /**
     * Handles api requests to The Cat API, with methods to display the data.
     * 
     * @param {string} apiKey API Key for The Cat API
     */
    
    constructor(apiKey) {
        this.apiKey = apiKey;
    }

    /**
     * Calls the api requesting all cat breeds.
     * 
     * @returns {Promise<Array>} Promise of array of each breed's raw data from API
     */
    async getAllBreeds () {
        
        let response = await fetch(`https://api.thecatapi.com/v1/breeds?attach_breed=0`, {
            method: "GET",
            mode: "cors",    
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            }
        });
        return response.json();
    }

    /**
     * Calls the api requesting five images of a specific breed by page.
     * 
     * @async
     * @param {Breed} breed       Breed Object 
     * @param {number} pageNumber Page number for request
     * 
     * @returns {Array<string>} Array with five sources of images.
     */
    async getBreedImages(breed, pageNumber) {

        // https://api.thecatapi.com/v1/images/search?limit=3&page=100&order=DESC
        // https://api.thecatapi.com/v1/images/search?breed_ids=beng

        let response = await fetch(`https://api.thecatapi.com/v1/images/search?breed_ids=${breed.id}&limit=5&page=${pageNumber}&order=ASC`, {
            method: "GET",
            mode: "cors",    
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': this.apiKey
            }
        });
        return response.json();

    }

}

class DOMHandler {

    /**
     * Handles all DOM manipulation for Breed objects.
     * @param {string}   anchorID     The ID of the parent the component will append itself to.
     * @param {string}   imageGridID  The ID of the element the images will be rendered to.
     * @param {function} linkCallback (Breed Object) The function to be called when the a breed link is clicked. Only param is a Breed Object. 
     * @param {function} nextPageCallback The function to be called when next page button is clicked. No params.
     * @param {function} backPageCallback The function to be called when previous page button is clicked. No params.
     */

    constructor(anchorID, imageGridID, linkCallback, nextPageCallback, backPageCallback) {
        this.anchorID = anchorID;
        this.imageGridID = imageGridID;
        this.linkCallback = linkCallback;
        this.backPageCallback = backPageCallback;
        this.nextPageCallback = nextPageCallback;

        this.isListOpen = false;
    }


    /**
     * Renders list of links to each breed.
     * @param {Array<Breed>} breedArray Array of breed objects to create links for
     */
    createBreedList(breedArray) {

        const listOpenButton = document.createElement('button');
        const list = document.createElement('ul');
        const listContainer = document.createElement('div');
        listContainer.id = 'breed-list-container'
        listContainer.classList.add('shrink')
        list.id = 'breed-list'
        listOpenButton.id = 'list-open-button';
        listOpenButton.textContent = 'Open';
        listOpenButton.onclick = () => {
            this.isListOpen = !this.isListOpen;
            listOpenButton.textContent = `${this.isListOpen?'Close':'Open'}`
            if(this.isListOpen) {
                listContainer.classList.remove('shrink')
            } else {
                listContainer.classList.add('shrink')
            }
        }
        listContainer.appendChild(list)
        listContainer.appendChild(listOpenButton)
        // document.getElementById(this.anchorID).appendChild(list);
        document.getElementById(this.anchorID).appendChild(listContainer);
        breedArray.forEach(b => {
            this.createBreedLink(b, list.id);
        })
    }


    /**
     * Hides list and updates open list button.
     */
    hideList() {
        this.isListOpen = false;
        document.getElementById('breed-list-container').classList.add('shrink');
        document.getElementById('list-open-button').textContent = `${this.isListOpen?'Close':'Open'}`

    }

    /**
     * Creates a list element with a link to the link callback.
     * @param {Breed} breed     Breed Object to be calledback.
     * @param {string} anchorID Where the list element will append iteself.
     */
    createBreedLink(breed, anchorID) {
        const listItem = document.createElement('li');
        const link = document.createElement('a');
        link.href = '#';
        link.id = breed.id;
        link.textContent = breed.name;
        link.onclick = (e) => {
            e.preventDefault();
            this.linkCallback(breed);
        }
        listItem.appendChild(link)
        document.getElementById(anchorID).appendChild(listItem)
    }

    /**
     * Clears the element of any inner html
     * @param {string} elementID ID of dom element to clear.
     */
    clearElement(elementID) {
        document.getElementById(elementID).innerHTML = '';
    }

    /**
     * Creates grid for image elements to append to
     * @param {string} anchorID ID of dom element this will attach itself to
     */
    createImageGrid(anchorID) {
        const grid = document.createElement('div');
        grid.id = this.imageGridID;
        grid.className = 'cat-image-container'
        // addEventListener('scroll', (e) => {
        //     grid.style.position = 'relative';
        //     grid.style.top = window.pageYOffset + 'px';
        // })
        document.getElementById(anchorID).appendChild(grid);
    }

    /**
     * Creates image element and appends to anchor
     * @param {string} imgSrc  Src of image
     * @param {boolean} isLast Show if image is 5th image for styling purposes
     */
    createImage(imgSrc, isLast) { 
        const image = document.createElement('img');
        image.src = imgSrc;
        image.className = `cat-image ${isLast===true?'last':''}`;
        document.getElementById(this.imageGridID).appendChild(image);
    }

    /**
     * Creates button container for the next and previous page buttons
     */
    createPageButtonContainer() {
        if(!document.getElementById('page-container')) {
            const container = document.createElement('div');
            const pageNumContainer  = document.createElement('div');
            const pageButtonContainer  = document.createElement('div');
            container.id = 'page-container';
            pageNumContainer.id = 'page-number-container';
            pageButtonContainer.id = 'page-button-container';
            container.appendChild(pageButtonContainer)
            container.appendChild(pageNumContainer)
            document.getElementById(this.anchorID).appendChild(container)
        }
    }

    /**
     * Renders the next page button
     */
    showNextPageButton() {
        if(!document.getElementById('next-page-button')) {
            const nextPageButton = document.createElement('a');
            nextPageButton.id = 'next-page-button';
            nextPageButton.textContent = 'Next Page';
            nextPageButton.href="#";
            nextPageButton.onclick = this.nextPageCallback;
            document.getElementById('page-button-container').appendChild(nextPageButton)
        } else {
            document.getElementById('next-page-button').classList.remove('hidden');
        }
    }

    /**
     * Shows the back page button
     */
    showBackPageButton() {
        if(!document.getElementById('back-page-button')) {
            const backPageButton = document.createElement('a');
            backPageButton.id = 'back-page-button';
            backPageButton.textContent = 'Back Page';
            backPageButton.href="#";
            backPageButton.onclick = this.backPageCallback;
            document.getElementById('page-button-container').appendChild(backPageButton)
        } else {
            document.getElementById('back-page-button').classList.remove('hidden');
        }
    }


    /**
     * Renders the page number
     * @param {number} pageNum Current page number
     */
    showPageNumber(pageNum) {
        if(!document.getElementById('page-number')) {
            const pageNumber = document.createElement('span');
            pageNumber.textContent = `Page ${pageNum}`;
            pageNumber.id = 'page-number';
            document.getElementById('page-number-container').appendChild(pageNumber)
        } else {
            document.getElementById('page-number').textContent = `Page ${pageNum}`
        }
    }

    /**
     * Renders heading for breed using name and description.
     * @param {Breed} breed
     */
    showBreedHeader(breed) {
        if(document.getElementById('header-small')) {
            document.getElementById('attribution-container').remove();
            document.getElementById('header-small').remove();
            const headerDescr = document.createElement('p');
            headerDescr.textContent = breed.description;
            headerDescr.id = 'header-description';
            document.getElementById('header').appendChild(headerDescr);
            document.getElementById('header-title').textContent = breed.name;
        } else {
            document.getElementById('header-title').textContent = breed.name;
            document.getElementById('header-description').textContent = breed.description;
        }
    }

    createIntroHeader() {
        const headerContainer = document.createElement('div');
        const headerTitle = document.createElement('h2');
        const headerSmall = document.createElement('h3');
        headerContainer.id = 'header';
        headerTitle.textContent = 'JS Code Challenge';
        headerTitle.id = 'header-title';
        headerSmall.id = 'header-small';
        headerSmall.textContent = 'Josiah Eakle | Feb 9, 2021'
        headerContainer.appendChild(headerTitle);
        headerContainer.appendChild(headerSmall);
        document.getElementById(this.anchorID).appendChild(headerContainer);
    }

    /**
     * Hides the next page button
     */
    hideNextPageButton() {
        document.getElementById('next-page-button').classList.add('hidden');
}

    /**
     * Hides the back page button
     */
    hideBackPageButton() {
        document.getElementById('back-page-button').classList.add('hidden');
    }


}


const Start = ( async () => {

    /**
     * This module is imediately invoked to handle the data and render the component with closure.
     */


    const myApiKey = process.env.API_KEY; // Normally this would be in a .env file
    
    let currentPage = 0;            // STATE - current page being rendered
    let currentBreed = undefined;   // STATE - current breed being rendered
    
    const gridID = `cat-image-grid`                 // DOM ID for element rendering images and next/previous buttons
    const apiHandler = new ApiHandler(myApiKey);    // API HANDLER - handles api requests
    const domHandler = new DOMHandler               // DOM HANDLER - renders components and handles DOM manipulation
        ('anchor', gridID, breedLinkClicked, nextPageClicked, backPageClicked);

    /**
     * Gets array of breeds from api and converts them into an array of breed objects 
     * @async
     */
    async function getBreeds() {
        let allBreedsData = await apiHandler.getAllBreeds();
        let allBreeds = allBreedsData.map((breed, i) => {
            return new Breed(breed.name, breed.id, breed.description);
        })
        return allBreeds;
    }

    /**
     * Calls DOMHandler class to render list of links
     * @param {Array<Breed>} breedArray Array of Breed objects to render list of
     */
    function renderList(breedArray) {
        domHandler.createBreedList(breedArray)
    }

    /**
     * Handles DOM breed link click event. Calls show breed images. Sets currentBreed and currentPage.
     * @param {Breed} breed Breed object to show images of
     */
    function breedLinkClicked(breed) {
        currentBreed = breed;
        currentPage = 0;
        domHandler.hideList();
        showBreedImages();
    }

    /**
     * Clears old images and renders new one to the image grid, also updates currentBreed.pageAmount. 
     */
    async function showBreedImages() {
        // Clear the image grid
        domHandler.clearElement(gridID)
        domHandler.showBreedHeader(currentBreed);
        // Get 5 images according to currentBreed and currentPage
        let imgSrcArray = await apiHandler.getBreedImages(currentBreed, currentPage);
        // Convert request data to an array of urls
        imgSrcArray = imgSrcArray.map(img => { return img.url }) 

        // if the array's length is not 5, update current page
        // else update the current page by checking next page
        if(imgSrcArray.length < 5) {
            currentBreed.pageAmount = currentPage;
        } else if(currentBreed.pageAmount === undefined) {
            let nextPage = await apiHandler.getBreedImages(currentBreed, currentPage+1);
            if(nextPage.length < 5 && nextPage.length > 0) {
                currentBreed.pageAmount = currentPage+1;
            } else if (nextPage.length === 0) {
                currentBreed.pageAmount = currentPage;
            }
        }

        // Render the images to the dom
        imgSrcArray.forEach((img, i, arr) => {
            let isLast = false;
            if(i === arr.length-1 && (arr.length%2 !== 0)) isLast = true;
            domHandler.createImage(img, isLast);
        });
        showPageButtons();

    }

    /**
     * Check page amount of current breed to hide or render the next and previous page buttons. Renders page number.
     */
    function showPageButtons() {
        domHandler.createPageButtonContainer();
        domHandler.showPageNumber(currentPage+1);
        domHandler.showNextPageButton();
        domHandler.showBackPageButton();
        if(currentPage >= currentBreed.pageAmount ) {
            domHandler.hideNextPageButton();
        }
        if(currentPage <= 0) {
            domHandler.hideBackPageButton();   
        }
    }

    /**
     * Handles previous page button click.
     */
    function backPageClicked() {
        if(currentPage > 0) {
            currentPage-=1;
            showBreedImages(currentBreed);
        }
    }

    /**
     * Handles next page button click.
     */
    function nextPageClicked() {
        if(currentPage < currentBreed.pageAmount || currentBreed.pageAmount === undefined) {
            currentPage+=1;
            showBreedImages(currentBreed);
        }
    }

    
    const breedArray = await getBreeds(); // Get breeds
    renderList(breedArray);               // Render list
    domHandler.createIntroHeader('anchor'); // Creates the header for intro and images
    domHandler.createImageGrid('anchor'); // Create container for images

})();



