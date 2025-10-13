"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contractController = void 0;
const contract_service_1 = require("../services/contract-service");
exports.contractController = {
    async create(req, res) {
        if (!req.user)
            return res.status(401).json({ message: 'Unauthorized' });
        try {
            const contract = await contract_service_1.contractService.createContract(req.user, req.body);
            res.status(201).json(contract);
        }
        catch (err) {
            console.error(err);
            res.status(400).json({ message: err.message || 'Internal Server Error' });
        }
    },
    async get(req, res) {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        try {
            const { search } = req.query;
            const contracts = await contract_service_1.contractService.getContracts(req.user.companyId, search);
            res.status(200).json(contracts);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || "Internal Server Error" });
        }
    },
    async update(req, res) {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const contractId = Number(req.params.id);
        try {
            const updatedContract = await contract_service_1.contractService.updateContract(contractId, req.body);
            res.status(200).json(updatedContract);
        }
        catch (err) {
            console.error(err);
            res.status(400).json({ message: err.message || "Internal Server Error" });
        }
    },
    async delete(req, res) {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const contractId = Number(req.params.id);
        try {
            await contract_service_1.contractService.deleteContract(contractId);
            res.status(200).end();
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || "Internal Server Error" });
        }
    },
    async getCarInfo(req, res) {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        try {
            const cars = await contract_service_1.contractService.getCarInfo(req.user.companyId);
            res.status(200).json(cars);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || "Internal Server Error" });
        }
    },
    async getCustomerInfo(req, res) {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        try {
            const customers = await contract_service_1.contractService.getCustomerInfo(req.user.companyId);
            res.status(200).json(customers);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || "Internal Server Error" });
        }
    },
    async getUserInfo(req, res) {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        try {
            const users = await contract_service_1.contractService.getUserInfo(req.user.companyId);
            res.status(200).json(users);
        }
        catch (err) {
            console.error(err);
            res.status(500).json({ message: err.message || "Internal Server Error" });
        }
    },
};
//# sourceMappingURL=contract-controller.js.map