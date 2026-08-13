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
class AggregateQueryBuilder {
    constructor(model, query) {
        this.model = model;
        this.query = query;
        this.pipeline = [];
    }
    search(searchableFields) {
        if (this.query.searchTerm) {
            const regex = new RegExp(this.query.searchTerm, 'i');
            this.pipeline.push({
                $match: {
                    $or: searchableFields.map(field => ({ [field]: { $regex: regex } })),
                },
            });
        }
        return this;
    }
    insertCustomStage(stage) {
        this.pipeline.push(...stage);
        return this;
    }
    filter(excludeFieldss = []) {
        const queryObj = Object.assign({}, this.query);
        const excludeFields = ['searchTerm', 'sort', 'page', 'limit', 'fields', ...excludeFieldss];
        excludeFields.forEach(f => delete queryObj[f]);
        Object.keys(queryObj).forEach(key => {
            if (queryObj[key] === '' || queryObj[key] == null)
                delete queryObj[key];
        });
        if (Object.keys(queryObj).length > 0) {
            this.pipeline.push({ $match: queryObj });
        }
        return this;
    }
    sort() {
        const sortParam = this.query.sort;
        const sortStage = {};
        if (sortParam) {
            sortParam.split(',').forEach(field => {
                const direction = field.startsWith('-') ? -1 : 1;
                sortStage[field.replace('-', '')] = direction;
            });
        }
        else {
            sortStage['createdAt'] = -1;
        }
        this.pipeline.push({ $sort: sortStage });
        return this;
    }
    fields() {
        if (this.query.fields) {
            const fields = this.query.fields.split(',');
            const projectStage = {};
            fields.forEach((f) => (projectStage[f] = 1));
            this.pipeline.push({ $project: projectStage });
        }
        return this;
    }
    populate(localField, foreignField, from, as) {
        this.pipeline.push({
            $lookup: {
                from,
                localField,
                foreignField,
                as,
            },
        });
        return this;
    }
    paginate() {
        const limit = Number(this.query.limit) || 10;
        const page = Number(this.query.page) || 1;
        const skip = (page - 1) * limit;
        this.pipeline.push({ $skip: skip });
        this.pipeline.push({ $limit: limit });
        return this;
    }
    exec() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.model.aggregate(this.pipeline);
        });
    }
    getPaginationInfo() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const countPipeline = [...this.pipeline];
            countPipeline.push({ $count: 'total' });
            const totalResult = yield this.model.aggregate(countPipeline);
            const total = ((_a = totalResult[0]) === null || _a === void 0 ? void 0 : _a.total) || 0;
            const limit = Number(this.query.limit) || 10;
            const page = Number(this.query.page) || 1;
            const totalPage = Math.ceil(total / limit);
            return { total, limit, page, totalPage };
        });
    }
}
exports.default = AggregateQueryBuilder;
