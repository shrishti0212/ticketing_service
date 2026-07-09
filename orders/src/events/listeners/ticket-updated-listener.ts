import { Message } from "node-nats-streaming";
import { Subjects, Listener, TicketUpdatedEvent } from "@sm02tickets/common";
import { Ticket } from "../../models/tickets";
import { queueGroupName } from "./queue-group-name";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
    subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
    queueGroupName = queueGroupName;

    async onMessage(data: TicketUpdatedEvent['data'], msg: Message){
        console.log(data);
        const tickets = await Ticket.find({});
        console.log(tickets);

        const ticket = await Ticket.findByEvent(data);
        console.log(ticket);

        if(!ticket){
            throw new Error('ticket not found');
        }

        const { title, price, orderId } = data;

        ticket.set({
            title,
            price,
            orderId,
        });

        await ticket.save();

        msg.ack();
    }
}