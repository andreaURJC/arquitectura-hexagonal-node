const mapper = require('../../mapper');
const ShoppingCartDomainModel = require('../../../domain/shoppingCarts/model');

const shoppingCartStore = {

    async create() {
        try {
            const { ShoppingCart : shoppingCartSchema } = this.getSchemas();
            const shoppingCart = new shoppingCartSchema({ state: ShoppingCartDomainModel.STATES.INITIAL });
            const savedCart = await shoppingCart.save();
            return mapper.toDomainModel(savedCart, ShoppingCartDomainModel);
        } catch (e) {
            throw e;
        }
    },

    async updateExistingProduct(params) {
        try {
            const { ShoppingCart : shoppingCartSchema } = this.getSchemas();

            const shoppingCartFound = await shoppingCartSchema.findOne({ _id: params.shoppingCart });
            const productToUpdate = shoppingCartFound.products.filter(item => item.product.toString() == params.product.id)[0];
            productToUpdate.quantity = params.product.quantity
            const shoppingCartSaved = await shoppingCartFound.save();

            return mapper.toDomainModel(shoppingCartSaved, ShoppingCartDomainModel);
        } catch (e) {
            throw e;
        }
    },

    async updateUnexistingProduct(params) {
        try {
            const { ShoppingCart : shoppingCartSchema } = this.getSchemas();

            const shoppingCartFound = await shoppingCartSchema.findOne({ _id: params.shoppingCart });
            shoppingCartFound.state = ShoppingCartDomainModel.STATES.IN_PROGRESS
            shoppingCartFound.products.push({ product: mapper.toObjectId(params.product.id), quantity: params.product.quantity });
            const shoppingCartSaved = await shoppingCartFound.save();

            return mapper.toDomainModel(shoppingCartSaved, ShoppingCartDomainModel);
        } catch (e) {
            throw e;
        }
    },

    async finalize(params) {
        try {
            const { ShoppingCart : shoppingCartSchema } = this.getSchemas();

            const shoppingCartFound = await shoppingCartSchema.findOne({ _id: params.shoppingCart });
            shoppingCartFound.state = ShoppingCartDomainModel.STATES.FINAL;
            const shoppingCartSaved = await shoppingCartFound.save();

            return mapper.toDomainModel(shoppingCartSaved, ShoppingCartDomainModel);
        } catch (e) {
            throw e;
        }
    },

    async get(params) {
        try {
            const { ShoppingCart : shoppingCartSchema } = this.getSchemas();
            let shoppingCart = await shoppingCartSchema.findOne({ _id: params.shoppingCart });
            if (!shoppingCart) {
                throw new Error('Shopping cart not found');
            }
            return mapper.toDomainModel(shoppingCart, ShoppingCartDomainModel);
        } catch (e) {
            throw e;
        }
    },

    async remove(params) {
        try {
            const { ShoppingCart : shoppingCartSchema } = this.getSchemas();
            let shoppingCart = await shoppingCartSchema.deleteOne({ _id: params.shoppingCart });
            if (!shoppingCart) {
                throw new Error('Shopping cart not found');
            }
            return mapper.toDomainModel(shoppingCart, ShoppingCartDomainModel);
        } catch (e) {
            throw e;
        }
    },

    async removeProduct(params) {
        try {
            const { ShoppingCart : shoppingCartSchema } = this.getSchemas();
            const shoppingCartFound = await shoppingCartSchema.findOne({ _id: params.shoppingCart });
            if (!shoppingCartFound) {
                throw new Error('Shopping cart not found');
            }
            const finalProducts = shoppingCartFound.products.filter(item => item.product.toString() != params.product);
            shoppingCartFound.products = finalProducts;
            const shoppingCartSaved = await shoppingCartFound.save();

            return mapper.toDomainModel(shoppingCartSaved, ShoppingCartDomainModel);
        } catch (e) {
            throw e;
        }
    }
};

module.exports.init = ({ ShoppingCart, Product }) => Object.assign(Object.create(shoppingCartStore), {
    getSchemas() { return { ShoppingCart, Product }; }
});