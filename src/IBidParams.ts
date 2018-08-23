import IPrice from './IPrice';
import { ID, BigInteger, DavID } from './common-types';
import IBasicParams from './IBasicParams';

/**
 * @interface IBidParams extends The interface IBidParams represent a valid argument of BidParams constructor.
 */
export default interface IBidParams extends IBasicParams {
    /**
     * @property The bid's topic id (used to send messages).
     */
    id: ID;
    /**
     * @property The bid's price (required).
     */
    price: IPrice | BigInteger;
    /**
     * @property The bid's vehicle DAV Id (required).
     */
    vehicleId: DavID;
}
