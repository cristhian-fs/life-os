# LifeOS

This projects contains a personal life organizer API and frontend

## Features

### Habits

- [x] It should be able to create a habit
- [x] It should be able to update a habit
- [x] It should be able to delete a habit
- [x] It should be able to archive a habit
- [x] It should be able to get user habits
- [x] It should be able to get a overview for each habit based on query parameters ('week', 'month', '3 months', '6 months', 'year', 'all')
- [x] It should be able to get a score history for each habit
  - Should work returning a percentage of how many habits were successfully made on each day,week,month,3months,6months,year and all
- [x] It should be able to get a history bar graph for each habit
- [x] It should be able to get a calendar map graph for each habit
- [x] It should be able to get a best streaks horizontal graph for each habit

### Entries

- [x] It should be able to create an entry for a habit
- [x] It should not be able to create an entry for a archived habit
- [x] It should be able to delete an entry
- [x] It should be able to update an entry

### Work

- [x] Should be able to create a work item of any type
- [x] Should be able to edit a work item, but not its type
- [x] Should be able to delete a work item
- [x] Should be able to get work items from a user

#### Analytics

- [x] Should be able to get the consumed work items by period and type
- [x] Should be able to get a work items backlog volume (items to_consume)
  - How many items has `status = to_consume` on each time point
- [x] Should be able to get a conversion tax: from everything that entered as `to_consume`, how much effectvely became `completed` vs was `abandoned`, a simple funnel (entered -> in_progress -> completed/abandoned)

#### Avg and velocity

- [ ] Should be able to get a avg of items by month, total completed divided by number of months on the range, or a movable range (last 3/6 months)
- [x] Avg consume time: difference between `started_at` and `completed_at`, how much average time, the user take to read a book vs a course
- [x] Avg "stopped on wishlist" time: from `created_at` to `started_at`, how many time on avg something keeps waiting before the user actually start.

### Dashboard

- [x] /habits/today: New http method to search for all user active habits, search for **today** entries with a new findManyByIdsAndDate, and return those ones which hasn't entries today
- [x] Progress KPI cards
  - [x] Current streak for each habit
  - [x] week/month Conclusion tax
- [x] Content consumption
  - [x] Total consumed on the current month
  - [x] Current backlog (how many `work` with status `to_consume` now)
  - [x] In progress now
- [x] Purchase wishlist
  - [x] Pending total (`purchase_wishlist` with `purchased_at IS NULL`)
  - [x] Total sum of `estimated_price` of the pending items
