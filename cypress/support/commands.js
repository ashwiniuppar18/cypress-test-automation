const selectors = require("../fixtures/selectors.json");

//Validate Image,Title and price
Cypress.Commands.add('validateProductPage', function (productJsonData) {
    let productUI = Cypress.$(selectors.productImage).length
    //Data validation from the UI and the backend
    cy.get(selectors.productHeaderCount).invoke('text').then(($text) => {
        expect($text).to.be.exist
    })
    for (let i = 0; i < productUI - 1; i++) {
        //Image validation
        cy.get(selectors.productImage).eq(i).should('exist')
        //title validation
        cy.get(selectors.productTitle).eq(i).invoke('text').then(($text) => {
            expect($text).to.eql(productJsonData.products[i].title)
        })
        //Price validation
        cy.get(selectors.productPrice).eq(i).invoke('text').then(($text) => {
            expect($text).to.contain(productJsonData.products[i].currencyFormat + "" + productJsonData.products[i].price)
        })
    }
})

//Validate product display when single filter is applied and validate data count with UI and backend
Cypress.Commands.add('validateProductDisplayForSingleFilter', function (productJsonData) {
    let sizes = productJsonData.products.map(value => value.availableSizes)
    // Get a single random size from the sizes array
    const randomSizeIndex = Math.floor(Math.random() * sizes.length);
    const randomSize = sizes[randomSizeIndex];

    // Apply the random size filter
    if (Array.isArray(randomSize)) {
        // If randomSize is an array, choose one value randomly from it
        const randomSizeValue = randomSize[Math.floor(Math.random() * randomSize.length)]
        cy.contains(randomSizeValue).click();
    } else {
        // If randomSize is not an array, use it directly
        cy.contains(randomSize).click();
    }
    cy.wait(3000)
    //Validate product count in UI and banckend
    cy.get(selectors.productHeaderCount).invoke('text').should('exist');
})

//Validate product display when multiple filters are applied and validate data count with UI and backend
//Validate the total count displayed on the product header page
Cypress.Commands.add('validateProductDisplayForTwoFilters', function (productJsonData) {
    const getRandomFilters = (data) => {
        // Get a random number between 2 and 3 to decide how many filters to apply
        const numberOfFilters = Cypress._.random(2, 3);

        // Shuffle the availableSizes array to get a random combination of filters
        const shuffledFilters = Cypress._.shuffle(data);

        // Get the first N filters from the shuffled array
        const randomFilters = shuffledFilters.slice(0, numberOfFilters);
        return randomFilters;
    };
    // Visit the URL where the UI displays the products


    // Get random filters for availableSizes
    const randomFilters = getRandomFilters(productJsonData.products.flatMap((product) => product.availableSizes));

    // Apply the filters for the random combination
    const filteredProducts = productJsonData.products.filter((product) =>
        randomFilters.every((size) => product.availableSizes.includes(size))
    );

    // Log the random filters and the total number of fetched products
    cy.log('Random Filters:', randomFilters);
    cy.log('Total Fetched Products:', filteredProducts.length);

    // Apply the filters on the UI
    randomFilters.forEach((filter) => {
        cy.contains(filter).click();
    });

    cy.wait(3000)
    // Get the product cards from the UI that match the filters
    cy.get(selectors.productHeaderCount).invoke('text').should('exist')
    //cy.get(selectors.productHeaderCount).should('contain', filteredProducts.length);


    // Filter the backend response with the same filters
    const filteredProductsBackend = productJsonData.products.filter((product) =>
        randomFilters.every((size) => product.availableSizes.includes(size))
    );

    // Validate that the number of filtered products matches between UI and backend
    expect(filteredProductsBackend.length).to.equal(filteredProducts.length);

    filteredProducts.forEach((product, index) => {
        expect(product.title).to.equal(filteredProductsBackend[index].title);
        expect(product.price).to.equal(filteredProductsBackend[index].price);
    });
})

//Validate products are added into the cart.
//Validate product count added matches to the one displayed.
//Validate title of the product added in the cart with the random data got added.
//Validate the removal of the product from the cart and assert the alert message.
//Validate the Close Icon
Cypress.Commands.add('validateProductCartDisplay', function () {
    cy.wait(3000)
    const selectedProductTitles = [];
    // Loop to add 3 random products to the cart
    for (let i = 0; i < 3; i++) {
        // Get all product elements
        cy.get(selectors.productCard).then((productElements) => {
            // Get a random product element
            const randomProductElement = Cypress._.sample(productElements);

            // Get the title of the selected product
            cy.wrap(randomProductElement).within(() => {
                cy.get(selectors.productTitle).invoke('text').then(($text) => {
                    const title = $text;
                    selectedProductTitles.push(title);
                });
            });
            // Click on "Add to Cart" for the selected product
            cy.wrap(randomProductElement).find('button').click({ force: true });
        });
    }
    cy.log(selectedProductTitles)

    cy.wait(2000)

    // Validate the cart count matches the number of products added (3 products)
    cy.get(selectors.productCartCount).contains('3');

    cy.wait(1000)
    // Extract the text values of the UI elements and store them in an array
    cy.get(selectors.productCartItem).then((elements) => {
        const uiTitles = [];
        cy.wrap(elements).each((element) => {
            cy.wrap(element).find('img').invoke('attr', 'alt').then((text) => {
                uiTitles.push(text);
            });
        }).then(() => {
            // Assert that the UI titles match the expected array values
            for (let j = 0; j < uiTitles.length; j++) {
                expect(uiTitles[j]).to.deep.equal(selectedProductTitles[j]);
            }
        });

        //Remove the product from the cart and validate the alert message displayed and close the tab
        cy.wrap(elements).each((element) => {
            cy.wrap(element).find("button[title='remove product from cart']").click()
        }).then(() => {
            cy.get(selectors.productCartAlertMessage).invoke('text').should('exist')
            cy.get(selectors.productCartCloseIcon).find('span').click()
        })
    });
})