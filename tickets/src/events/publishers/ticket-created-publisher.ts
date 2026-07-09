import { Publisher, Subjects, TicketCreatedEvent } from "@sm02tickets/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent>{
    subject: Subjects.TicketCreated = Subjects.TicketCreated;
}