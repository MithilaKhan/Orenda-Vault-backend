"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.elasticHelper = void 0;
const elastic_search_1 = require("../../config/elastic-search");
const createIndex = (indexName, id, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!indexName || !id || !data)
            return;
        const newData = Object.assign({}, data);
        if (newData._id)
            delete newData._id;
        const clientExists = yield elastic_search_1.esClient.indices.exists({
            index: indexName.toLowerCase(),
        });
        if (!clientExists) {
            yield elastic_search_1.esClient.indices.create({ index: indexName.toLowerCase() });
        }
        yield elastic_search_1.esClient.index({
            index: indexName.toLowerCase(),
            id,
            body: newData,
        });
        yield elastic_search_1.esClient.indices.refresh({ index: indexName.toLowerCase() });
        console.log('index created');
    }
    catch (error) {
        console.log(error);
    }
});
const searchIndex = (indexName, query, fields) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const response = yield elastic_search_1.esClient.search({
            index: indexName.toLowerCase(),
            body: {
                query: {
                    multi_match: {
                        query: query,
                        fields: (fields === null || fields === void 0 ? void 0 : fields.length) ? fields : ['*'],
                        fuzziness: 'AUTO',
                    },
                },
                highlight: {
                    pre_tags: ['<em>'],
                    post_tags: ['</em>'],
                    require_field_match: false,
                    fields: {
                        "place": {},
                    },
                },
            },
        });
        return response.hits.hits;
    }
    catch (error) {
        console.log(error);
    }
});
const updateIndex = (indexName, id, data) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!indexName || !id || !data)
            return;
        const newData = Object.assign({}, data);
        if (newData._id)
            delete newData._id;
        yield elastic_search_1.esClient.update({
            index: indexName.toLowerCase(),
            id,
            body: {
                doc: newData,
                doc_as_upsert: true,
            },
        });
    }
    catch (error) {
        console.log(error);
    }
});
const deleteIndex = (indexName, id) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!indexName || !id)
            return;
        yield elastic_search_1.esClient.delete({
            index: indexName.toLowerCase(),
            id,
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.elasticHelper = {
    createIndex,
    searchIndex,
    updateIndex,
    deleteIndex
};
