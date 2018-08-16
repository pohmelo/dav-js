import { ID, Observable } from './common-types';
import IConfig from './IConfig';
import BidParams from './BidParams';
import NeedParams from './NeedParams';
import Bid from './Bid';
import MessageParams from './MessageParams';
import Kafka from './Kafka';
import Message from './Message';
import KafkaMessageStream from './KafkaMessageStream';

/**
 * @class The Need class represent a service request.
 */
export default class Need<T extends NeedParams, U extends MessageParams> {

    // DON'T USE THIS VARIABLE DIRECTLY! ONLY VIA ITS GETTER!
    private _kafkaMessageStream: KafkaMessageStream;

    get params(): T {
        return this._params;
    }

    // TODO: private members name should start with underscore
    constructor(private _selfId: ID, private _params: T, private config: IConfig) {
        /**/
    }

    // sadly, async cannot be used in normal getter
    private async getKafkaMessageStream(): Promise<KafkaMessageStream> {
        if (!this._kafkaMessageStream) {
            this._kafkaMessageStream = await Kafka.messages(this._params.id, this.config); // Channel#3
        }
        return this._kafkaMessageStream;
    }
    /**
     * @method createBid Used to create a new bid for the current need and publish it to the service consumer.
     * @param params The bid parameters.
     * @returns The created bid.
     */
    // TODO: rename params to bidParams
    public async createBid<V extends BidParams>(params: V): Promise<Bid<V, U>> {
        const neederId = this._params.id; // Channel#3
        // TODO: fix typo (bidder)
        const biderId = Kafka.generateTopicId(); // Channel#6
        params.id = biderId;
        params.needTypeId = this._selfId;
        try {
            await Kafka.createTopic(biderId, this.config);
        } catch (err) {
            // TODO: move this general message to kafka.createTopic
            throw new Error(`Fail to create a topic: ${err}`);
        }
        await Kafka.sendParams(neederId, params, this.config);
        return new Bid<V, U>(biderId, params, this.config);
    }
    /**
     * @method bids Used to subscribe for bids for the current need.
     * @param bidParamsType The expected bid param object type.
     * @returns Observable for bids subscription.
     */
    public async bids<V extends BidParams>(bidParamsType: new (...all: any[]) => V): Promise<Observable<Bid<V, U>>> {
        // TODO: change kafkaStream to bidParamsStream
        const kafkaMessageStream: KafkaMessageStream = await this.getKafkaMessageStream();
        const bidParamsStream = kafkaMessageStream.filterType(bidParamsType);
        const bidStream = bidParamsStream.map((bidParams) => new Bid(this._selfId, bidParams, this.config));
        return Observable.fromObservable(bidStream, this._params.id);
    }
    /**
     * @method sendMessage Used to send a message to the service consumer.
     * @param params The message parameters.
     */
    public async sendMessage(params: U): Promise<void> {
        if (this._selfId === this._params.id) {
            throw new Error(`You cannot send message to your own channel`);
        }
        params.senderId = this._selfId; // Channel#2
        // TODO: should await this call or remove the async keyword
        return Kafka.sendParams(this._params.id, params, this.config); // Channel#3
    }
    /**
     * @method messages Used to subscribe for messages for the current need.
     * @param messageParamsType The expected mission param object type.
     * @returns Observable for messages subscription.
     */
    public async messages(messageParamsType: new (...all: any[]) => U): Promise<Observable<Message<U>>> {
        const kafkaMessageStream: KafkaMessageStream = await this.getKafkaMessageStream();
        const messageParamsStream: Observable<U> = kafkaMessageStream.filterType(messageParamsType);
        const messageStream = messageParamsStream.map((params: MessageParams) =>
            new Message<U>(this._selfId, params, this.config));
        return Observable.fromObservable(messageStream, messageParamsStream.topic);
    }
}
