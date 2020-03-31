Should the invalidator (Say createfinancialportalresponse is deleted, invalidating some other thing X) since there could be many createFinancialPortalResponses, who is the invalidator to x? 

refactor evict policy to be boolean and wait until all predicates run for the different dataIds and store field names across the current type, then batch the eviction at the end, only calling it once for the same set of field names,
doable by throwing them in a map as it goes through.

rename to parent instead of invalidator solves point 1 since they're all parents to the thing not necessarily the one that invalidated it