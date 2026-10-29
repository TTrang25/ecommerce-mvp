const express = require('express');

function createProductRoutes(productService) {
  const router = express.Router();

  router.get('/', async (req, res, next) => {
    try {
      const products = await productService.getProducts();
      res.json(products);
    } catch (error) {
      next(error);
    }
  });

  router.get('/:pid', async (req, res, next) => {
    try {
      const pid = Number(req.params.pid);

      if (!Number.isInteger(pid) || pid <= 0) {
        return res.status(400).json({
          message: 'Invalid product id'
        });
      }

      const product = await productService.getProduct(pid);
      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  router.post('/', async (req, res, next) => {
    try {
      const product = await productService.createProduct(req.body);
      res.status(201).json(product);
    } catch (error) {
      next(error);
    }
  });

  router.put('/:pid', async (req, res, next) => {
    try {
      const pid = Number(req.params.pid);

      if (!Number.isInteger(pid) || pid <= 0) {
        return res.status(400).json({
          message: 'Invalid product id'
        });
      }

      const product = await productService.updateProduct(
        pid,
        req.body
      );

      res.json(product);
    } catch (error) {
      next(error);
    }
  });

  router.delete('/:pid', async (req, res, next) => {
    try {
      const pid = Number(req.params.pid);

      if (!Number.isInteger(pid) || pid <= 0) {
        return res.status(400).json({
          message: 'Invalid product id'
        });
      }

      await productService.deleteProduct(pid);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  });

  return router;
}

module.exports = createProductRoutes;
