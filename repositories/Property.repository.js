const promisify = require('../utils/promisify')
const { createInsertQuery, createUpdateQuery } = require('../utils/queryBuilder')
const CompanyRepository = require('./Company.repository')

module.exports = class PropertyRepository {
    static async create({ sellerId, location, price, area, numBeds, numBath, info, phase, type }) {
        let [{ isProhibited }] = await CompanyRepository.searchById(sellerId)
        if (isProhibited) return null
        await promisify({
            sql: createInsertQuery('property', ['sellerId', 'location', 'price', 'area', 'numBeds', 'numBath', 'info', 'phase', 'type']),
            values: [sellerId, location, price, area, numBeds, numBath, info, phase, type]
        })
        let [{ id }] = await promisify({
            sql: `select max(id) as id from property
                where sellerId=?;`,
            values: [sellerId]
        })
        return id
    }
    static async getCompanyInfo({ propertyId }) {
        let [company] = await promisify({
            sql: `SELECT company.id,company.name,company.location,company.image,company.phoneNumbers,company.email
                from company, property
                where
                    property.id = ?
                    and company.id = property.sellerId;`,
            values: [propertyId]
        })
        company.password = null
        return company
    }
    static async getProperties() {
        return promisify({
            sql: `select * from property where   isnull(newOwner);`

        })
    }

    static async getUserOwnedProperties({ userId }) {
        return promisify({
            sql: `select * from property where newOwner=?;`,
            values: [userId]
        })
    }

    static async setPropertyImages({ id, images }) {
        promisify({
            sql: `${createUpdateQuery('property', ['images'])} where id=?;`,
            values: [images, id]
        })
    }
    static async searchPropertybyId({ id }) {
        let [property] = await promisify({
            sql: `select * from property where id=?`,
            values: [id]
        })
        return property
    }

    static async filter({ location, phase, price, type }) {

        let filterquery = []
        let values = []
        if (location != '') {
            filterquery.push(`location=? `);
            values.push(location)
        }
        if (phase != '') {
            filterquery.push(`phase=? `);
            values.push(phase)
        }
        if (type != '') {
            filterquery.push(`type=? `);
            values.push(type)
        }
        if (price != '') {
            let range = price.split('-')
            filterquery.push(`price >=? and price <=? `);
            values = [...values, ...range]
        }
        let sql = filterquery.length ? `select * from property where ${filterquery.join(' and ')};` : `select * from property;`
        return promisify({
            sql,
            values
        })
    }


    static async update({ id, images, newOwner, location, price, area, numBeds, numBath, info, phase, type }) {
        let fields = []
        let fieldNames = []
        if (location) {
            fields.push(location)
            fieldNames.push('location')
        }
        if (price) {
            fields.push(price)
            fieldNames.push('price')
        }
        if (images) {
            fields.push(images)
            fieldNames.push('images')
        }
        if (newOwner) {
            fields.push(newOwner)
            fieldNames.push('newOwner')
        }
        if (area) {
            fields.push(area)
            fieldNames.push('area')
        }
        if (numBeds) {
            fields.push(numBeds)
            fieldNames.push('numBeds')
        }
        if (numBath) {
            fields.push(numBath)
            fieldNames.push('numBath')
        }
        if (info) {
            fields.push(info)
            fieldNames.push('info')
        }
        if (phase) {
            fields.push(phase)
            fieldNames.push('phase')
        }
        if (type) {
            fields.push(type)
            fieldNames.push('type')
        }
        promisify({
            sql: `${createUpdateQuery('property', fieldNames)} where id=?;`,
            values: [...fields, id]
        })
    }

}