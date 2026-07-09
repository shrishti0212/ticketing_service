import express, { Request, Response, Router} from 'express';
import { stripe } from '../stripe';
import { body } from 'express-validator';

import { requireAuth, validateRequest, BadRequestError, NotFoundError, NotAuthorizedError, OrderStatus } from '@sm02tickets/common';
import { Order } from '../models/order';
import { Payment } from '../models/payment';
import { PaymentCreatedPublisher } from '../events/publishers/payment-created-publisher';
import { natsWrapper } from '../nats-wrapper';

const router = express.Router();

router.post('/api/payments', requireAuth, [body('token').not().isEmpty(), body('orderId').not().isEmpty()],
    validateRequest,
    async(req:Request, res: Response) => {
        const { token, orderId } = req.body;

        const order = await Order.findById(orderId);
        console.log("Order:", order);

        if (!order) {
        console.log("Order not found");
        throw new NotFoundError();
        }

        if (order.userId !== req.currentUser!.id) {
        console.log("User mismatch");
        throw new NotAuthorizedError();
        }

        if (order.status === OrderStatus.Cancelled) {
        console.log("Order cancelled");
        throw new BadRequestError("cannot pay for a cancelled order");
        }

        console.log("Creating Stripe charge...");       

        
        const charge = await stripe.charges.create({
            currency: "usd",
            amount: order.price * 100,
            source: token,
        });

        const payment = Payment.build({
            orderId,
            stripeId: charge.id,
        });
        
        await payment.save();  
        new PaymentCreatedPublisher(natsWrapper.client).publish({
            id: payment.id,
            orderId: payment.orderId,
            stripeId: payment.stripeId
        });

        res.status(201).send({ id: payment.id });
    }
);

export {router as createChargeRouter};