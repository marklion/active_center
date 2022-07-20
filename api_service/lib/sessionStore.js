const schema = {
    _id: String,
    data: Object,
    updatedAt: {
        default: new Date(),
        expires: 86400, // 1 day
        type: Date
    }
};
module.exports = class MongooseStore {
    constructor({
                    collection = 'sessions',
                    connection = null,
                    expires = 86400,
                    name = 'Session'
                } = {}) {
        if (!connection) {
            throw new Error('params connection is not collection');
        }
        const updatedAt = {...schema.updatedAt, expires};
        const {base} = connection;
        this.session = base.model(name, new base.Schema({...schema, updatedAt}));
    }

    async remove(id) {
        const {session} = this;
        return session.remove({_id: id});
    }
    async destroy(key, opts){
        return await this.remove(key)
    }

    async get(id) {
        const {session} = this;
        const sessionData = await session.findById(id);
        return sessionData && sessionData.data;
    }

    async save(id, data) {
        const {session} = this;
        const record = {_id: id, data, updatedAt: new Date()};
        await session.updateOne({_id: id}, record, {upsert: true, safe: true});
        return data;
    }
    async set(key, sess, maxAge, opts) {
        return await this.save(key, sess);
    }

    async load(id) {
        const {session} = this;
        let obj = await session.findById(id);
        if (obj) {
            return obj.data;
        } else {
            return null;
        }
    }

    static create(opts) {
        return new MongooseStore(opts);
    }
}
