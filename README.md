# Project Pure

Improve simplicity and efficiency of the Scrollback codebase. Make it better
suited for scaling up HeyNeighbor and other similar apps.

[![build status](https://travis-ci.org/scrollback/pure.svg?branch=master)](https://travis-ci.org/scrollback/pure)
[![dependencies](https://david-dm.org/scrollback/pure.svg)](https://david-dm.org/scrollback/pure)

## Key changes and business benefits

### Architectural improvements
Including:
- Refactoring of modules in line with single responsibility
- Client-server communication using setstate and statechange
- Distributed architecture using Postgres listen/notify
- Common cache implementation for both client and server

Benefits:
- Real and perceived performance
- Scalability
- Faster development of other features
- Faster on-boarding of new developers

### Item base class
Base class for texts, threads, rooms, topics and privchats.
```
type: (text/thread/room/topic/privchat)
parentId: { parentType: <id> or [<ids>] }
count: { countType: <number> }
```
This is a dependency for the changes below.

### User-item relations
```
user:     (<userId>/<userIdentity>)
role:     (banned/none/visitor/mentioned/follower/moderator/owner)
status:   (writing/reading/online/reachable/offline)
intent:   (downvote/mute/upvote)
interest:   <number between 0 and 100>
reputation: <number between 0 and 100>
```
Enables the following features:
- “Heart” text or thread
- Flag a text or thread as offensive
- Mute thread
- Ban user from thread
- “Someone is typing”
- Invite non-users
- More relevant notifications

### Item parents
- Organizes texts in threads or privchats, threads in rooms and topics
- Organizes rooms and topics in hierarchies (Apartment > Locality > City)

### Item counts
Allows display of:
- Thread, follower and online counts in room/topic listings
- Number of hearts on a text or thread

### Relation scores
- Interest and reputation scores to improve notification relevance

### User counts
- Track private messages without replies
- Gamification: show total “hearts” received on profile
- Experience points on profile

### User privileges
- App-level bans (permanent and time-bound)
- Cap on number of rooms user is allowed to follow
- Custom cap on private messages w/o replies

### Query pagination with custom sort order
- Improves server scalability through partial retrieval of relations and notifications
- Sort threads by “liveness” score, _f(startTime, updateTime, upvotes)_
- Sort text search results by _f(recency, relevance)_

### Separate unread from notifications
- Performance improvements

### Item/user tombstones
  - User/Room delete/rename
