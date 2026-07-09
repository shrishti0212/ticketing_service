import { Subjects, Publisher, PaymentCreatedEvent } from "@sm02tickets/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent>{
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}