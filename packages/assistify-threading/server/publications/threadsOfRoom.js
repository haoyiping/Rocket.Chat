import { Meteor } from 'meteor/meteor';
import { RocketChat } from 'meteor/rocketchat:lib';

Meteor.publish('threadsOfRoom', function(rid, limit = 50) {
	if (!this.userId) {
		return this.ready();
	}
	const publication = this;

	const user = RocketChat.models.Users.findOneById(this.userId);
	if (!user) {
		return this.ready();
	}
	if (!Meteor.call('canAccessRoom', rid, this.userId)) {
		return this.ready();
	}
	const cursorHandle = RocketChat.models.Messages.findByRoomIdAndType(rid, 'create-thread', { sort: { ts: -1 }, limit }).observeChanges({
		added(_id, record) {
			return publication.added('rocketchat_threads_of_room', _id, record);
		},
		changed(_id, record) {
			return publication.changed('rocketchat_threads_of_room', _id, record);
		},
		removed(_id) {
			return publication.removed('rocketchat_threads_of_room', _id);
		},
	});
	this.ready();
	return this.onStop(function() {
		return cursorHandle.stop();
	});
});
