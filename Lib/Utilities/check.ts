import { BridgeHandler } from '../Handler';
import { ControllerI } from '../Controller';

export const isController = (data: any): data is ControllerI => {
  return typeof data === 'object' && data.handler !== undefined && data.isBridgeController;
};

export const isBridgeHandler = (data: any): data is BridgeHandler => {
  return (
    typeof data === 'object' && data.resolve !== undefined && typeof data.resolve === 'function' && data.isBridgeHandler
  );
};
