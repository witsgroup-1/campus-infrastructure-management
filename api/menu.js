
const express = require('express');
const menuRouter = express.Router();

// Mock menu data
const menuData = {
    menus: [
        {
            menu_id: 'M001',
            name: 'Breakfast',
            items: [
                { item_id: 'I001', name: 'Pancakes'},
                { item_id: 'I002', name: 'Scrambled Eggs' }
            ]
        },
        {
            menu_id: 'M002',
            name: 'Lunch',
            items: [
                { item_id: 'I003', name: 'Chicken Salad' },
                { item_id: 'I004', name: 'Vegetarian Pizza'}
            ]
        }
    ]
};

// API route to get all menus
menuRouter.get('/menus', (req, res) => {
    res.json(menuData);
});

// API route to get a specific menu by ID
menuRouter.get('/menus/:id', (req, res) => {
    const menu = menuData.menus.find(m => m.menu_id === req.params.id);
    if (menu) {
        res.json(menu);
    } else {
        res.status(404).json({ message: 'Menu not found' });
    }
});

module.exports = menuRouter;
