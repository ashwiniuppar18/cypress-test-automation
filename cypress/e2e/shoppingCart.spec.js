/// <reference types="cypress" />

let productJsonData = {}
const baseUrl = 'https://react-shopping-cart-67954.firebaseapp.com/';

describe('React App Shopping', () => {
    before(() => {
        // Fetch the JSON data from the URL and store it in the variable
        cy.visit(baseUrl)
        cy.request({
            method: 'GET',
            url: 'https://react-shopping-cart-67954.firebaseio.com/products.json',
            responseType: 'json',
        }).then((response) => {
            productJsonData = response.body;
            return productJsonData
        });

    });

    it('Validate All the Images, Title & Prices of the products', () => {
        cy.validateProductPage(productJsonData)
    });

    it('Apply single filter to the products by randome size', () => {
        cy.visit(baseUrl)
        cy.validateProductDisplayForSingleFilter(productJsonData)
    })



    it('should apply random size filters(2,3) and validate from UI and backend', () => {
        cy.visit(baseUrl)
        cy.validateProductDisplayForTwoFilters(productJsonData)
    });

    it('Validate Product Cart Display', () => {
        cy.visit(baseUrl)
        cy.validateProductCartDisplay()
    })
})




