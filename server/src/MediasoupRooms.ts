import { Observer } from "@observertc/observer-js";
import * as mediasoup from "mediasoup";
import { MediasoupRoom, RoomConfig } from "./MediasoupRoom";
import { mediaCodecs } from './constants';

export type WorkerAppData = {
	ip: string,
	announcedIp: string,
};

export class MediasoupRooms {
	private _creatingRooms = new Map<string, Promise<MediasoupRoom>>();
	private _rooms = new Map<string, MediasoupRoom>();
	
	public constructor(
		private _worker: mediasoup.types.Worker,
		private _observer: Observer
	) {

	}

	public async getOrCreateRoom(roomId: string): Promise<MediasoupRoom> {
		const existingRoom = this._rooms.get(roomId);
		if (existingRoom) return existingRoom;
		if (this._creatingRooms.has(roomId)) {
			const creatingRouter = this._creatingRooms.get(roomId);
			if (creatingRouter) {
				return creatingRouter;
			}
		}
		const { ip, announcedIp } = this._worker.appData as WorkerAppData;
		const creatingRoom = this._worker.createRouter({
			mediaCodecs
		}).then((router) => {
			const rooms = this._rooms;
			const roomConfig: RoomConfig = {
				roomId,
				ip,
				announcedIp,
			};
			const room = new class extends MediasoupRoom{
				protected onClosed(): void {
					rooms.delete(roomId);
				}
			}(
				roomConfig, 
				router,
				this._observer,
			);
			rooms.set(roomId, room);
			return room;
		});
		creatingRoom.finally(() => {
			this._creatingRooms.delete(roomId);
		});
		this._creatingRooms.set(roomId, creatingRoom);
		return creatingRoom;
	}

	public close() {

	}

}