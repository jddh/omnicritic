#!/usr/bin/env bash

#extract intl strings and merge with extant, preserving old values

npm run extract -- 'src/**/*.js*' --out-file /tmp/rebrand.json && jq -n --slurpfile master lang/rebrand.json --slurpfile slave /tmp/rebrand.json '($master[0] + $slave[0]) as $merged | $merged | reduce keys_unsorted[] as $key ({}; .[$key] = if $master[0][$key] == null then $slave[0][$key] else $master[0][$key] end)' > /tmp/merged.json && cp /tmp/merged.json lang/rebrand.json