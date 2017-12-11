// by 1app
import {Rest} from 'express-restful-es6';

@Rest('/v1/')
class SimpleResource {

    get(){
        return { msg: 'hello '}
    }
}
