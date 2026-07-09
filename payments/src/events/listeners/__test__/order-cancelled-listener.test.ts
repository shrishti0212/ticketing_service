

import { OrderCancelledEvent, OrderStatus } from "@sm02tickets/common";
import { Message } from "node-nats-streaming";
import { natsWrapper } from "../../../nats-wrapper"
import { OrderCancelledListener } from "../order-cancelled-listener"
import mongoose from "mongoose";
import { Order } from "../../../models/order";


const setup = async () =>{
    const listener = new OrderCancelledListener(natsWrapper.client);

    
    const order = Order.build({
        id: new mongoose.Types.ObjectId().toHexString(),
        status: OrderStatus.Created,
        price:10,
        userId: 'bciehfie',
        version: 0
    })
    await order.save();

    const data : OrderCancelledEvent['data'] = {
        id: order.id,
        version: 1,
        ticket:{
            id: 'beufhe'
        }
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn()
    };

    return{listener, data, msg, order};
};

it('updates the status of the order', async() =>{
    const{listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const Updatedorder = await Order.findById(data.id);

    expect( Updatedorder!.status).toEqual(OrderStatus.Cancelled);
});

it('acks the message' , async () => {
    const {listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

