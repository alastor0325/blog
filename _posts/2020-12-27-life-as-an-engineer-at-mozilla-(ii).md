---
date: 2020-12-27 01:09:43
layout: post
title: "Life as an engineer at Mozilla (II)"
subtitle:
description:
image: /assets/img/uploads/firefox-quantum-robot.webp
optimized_image:
category: life
tags:
  - life
  - tech
  - mozilla
paginate: false
---

In this post, I'm going to go through the process of solving issues for Gecko. Gecko, as a platform, contains a lot of different components dealing with all kinds of issues happening on the web. It's impossible to have a bug-free software, so having a good bug tracking tool can help developers better organize their tasks and make their plans.

### Bugs Tracking and Triaging

In Mozilla, we use [Bugzilla](https://bugzilla.mozilla.org/home) to track all related issues, and there are many different products and compoents you can choose when you want to [file a bug](https://bugzilla.mozilla.org/enter_bug.cgi), which helps to categorize issues to right places in the first step. For example, the component I mainly work on is [Core::Audio/Video: Playback](https://mzl.la/3aJeDnm) that is for issues related with media elements (remember `<Audio>` and `<Video>`?).

After a bug is filed on Bugzilla, we have to first check if there is an already filed same bug, or if this bug is filed in the right component. As you see, there are huge amounts of bugs in the list, and it still keeps growing and growing. To be honest, it’s hard to catch up with the speed of how fast the amount of bugs grows due to limited engineer resources, so in this stage, we also need to indentify what issues are really important, what issues are false alarm.

We use [Triage Center](https://mozilla.github.io/triage-center/) to find bugs in the components we want to traige. Then, go through those bugs and diagnose issues. There are so many possible reasons which could result in an issue, and it might be caused by installed web extentions, incorrectly modifying the internal config, intefering by external softwares, graphic driver issues, weird system setup...e.t.c.

After we confirm that an issue is Firefox's fault, we would assign the priotify and serverity to that bug. Every team has their own different definition for the bug priority that ideally should only be set by team members, not by bug reporters. For [severity](https://firefox-source-docs.mozilla.org/bug-mgmt/guides/severity.html) most teams follow the same definition.

### Diagnosing Problems

There are several ways to ask information from bug reporters, the first method we would take is to ask them to provide information from `about:support` page. (typing `about:support` in Firefox URL bar) That page contains all the information about users' system, what version of Firefox they are using, what config their are using (Did they change important config?), and also provides links to other important pages used to help developing, such as `about:memory` (check memory usage for each indivisual tab) and `about:performance` (energy impact for each indivisual tab).

![about:support]({{site.baseurl}}/assets/img/uploads/Life_Mozilla_II/about_support.png)
<figcaption><sub><sup>`about:support` page</sup></sub></figcaption>

If an issue is performance facing, such like video or audio stuttering, then we will usually ask them to enable Firefox [profiler](https://profiler.firefox.com/) that allows users to do a real-time profiling on multiple processes and threads. By adding labels and markers in our code, the profiler is able to know the callstack and what component those function calls belong to. In the profiler setting, you can use the default preset or customize a setting to profile the threads you want to investigate.

![Firefox Profiler]({{site.baseurl}}/assets/img/uploads/Life_Mozilla_II/profiler.jpeg)
<figcaption><sub><sup>Firefox Profiler</sup></sub></figcaption>

### Problem Solving and Code Review

Then, it's time to roll up our sleeves and get thing fixed! Mozilla has built a site called [SearchFox](https://searchfox.org/mozilla-central/source/dom/media) which allows you to find the references or definitions easily and check the history of the code. (I personally mix using that site with IDE, because searching references in SearchFox is really fast) By the way, Mozilla supports using both [Mercurial](https://www.mercurial-scm.org/) and [Git](https://git-scm.com/) for the version control.

Let's take this [bug](https://bugzilla.mozilla.org/show_bug.cgi?id=1634489) as an example, which is about failing to play some certain mp3 files. As I was able to reproduce the issue on my computer, and I had confirmed that the problem was caused by Firefox via checking the debug log, we can then dive in the field deeper to investigate the root cause.

After some investigation, I found that the problem was in our mp3 ID3 parser that can't handle a file containing multiple [ID3v2](https://id3.org/id3v2.4.0-structure) tags, which is used to contain the media metadata, such as artist, song name...e.t.c. That is an unusual situation because normally we only need one ID3v2 tag per mp3 file enough, the specification doesn't prohibit that though.

Therefore, I got my solution and submitted it onto [Phabricator](https://www.phacility.com/) that is a web-based software development collaboration tools and we use it as a code review platform. The patches we submitted onto Phabricator would be checked automatically by various tools, eg. [clang-format-linter](https://github.com/vhbit/clang-format-linter), in order to check if there is any syntax or coding style problems.

In Mozilla, we have module [owner and peers](https://wiki.mozilla.org/Modules/All) who are responsible to the code in those modules, but those information on the page isn't up to date. So if you can't find them for a review, just looking into the history and see who managed the code review most for the file you want to modify.

### Testing! Testing! Testing!

Say it triple because it's important! In Mozilla, we have various kinds of [testing](https://developer.mozilla.org/en-US/docs/Mozilla/QA/Automated_testing) (that is an achieved page, because I didn't find a new page containing all tests). In the opposite to those Gecko-only testings, we also run the [web platform tests](https://web-platform-tests.org/) which is used to create consistent tests across different browsers. If the thing we're testing is more related to web API behaviors which should be consistent in all browsers, then writing a web platform test is the best choice. We can see the testing result across different browsers in [wpt.fyi](https://wpt.fyi/results/?label=experimental&label=master&aligned). We also have a tool to measure the [test coverage](https://coverage.moz.tools/) in our codebase.

Only limited number of unit tests are integrated into Phabricator, so we have another testing platform to run all automation tests, which is our [try server](https://firefox-source-docs.mozilla.org/tools/try/index.html). By using different [selectors](https://firefox-source-docs.mozilla.org/tools/try/selectors/index.html), we're able to choose what tests we're going to run on the try server, and what platforms you want those tests running on.

In the example I showed above, I chose to write a [mochitest](https://developer.mozilla.org/en-US/docs/Mozilla/Projects/Mochitest) to simulate playing a mp3 file which has multiple ID3v2 tags via an audio element, and check whether it can start playing correctly. If the bug I'm fixing involves tab's activity changes, then I would choose to write a higher level test, [browser chrome test](https://developer.mozilla.org/en-US/docs/Mozilla/Browser_chrome_tests), which allows operating tabs directly as if users are operating real actions. If we need to compare the visual difference, then [reftest](https://firefox-source-docs.mozilla.org/web-platform/writing-tests/reftests.html) would be your friend.

The higher level test is, the more unstable test is. Because comparing with lower level test, it would have needed to rely on more modules. So choosing what test you should use is important depending on the scale of the problem you’re working on.

### Landing The Fix

Finally, you're only a step away from the destination, after we pass the code review and all testing on the try server. We have several branches for Firefox, the one we would encouter first is ["autoland"](https://hg.mozilla.org/integration/autoland/) which is a branch where all new changes would be landed first to see if they would break anything, from builds to tests.  It’s like a frontline of battlefield where all those new changes are battling each other and we only want to pick those good and stable changes into next stage.

After we ensure that those new changes are all good by baking them on the autoland for a while (usaually serveral hours to a day), then they would go to the next branch ["central"](https://hg.mozilla.org/mozilla-central), which is used to build a [Nightly version of Firefox](https://www.mozilla.org/en-US/firefox/channel/desktop/#nightly). Besides that, we also have ["beta"](https://hg.mozilla.org/releases/mozilla-beta/) for [Firefox Beta and Developer Edition](https://www.mozilla.org/en-US/firefox/channel/desktop/#beta), and ["release"](https://hg.mozilla.org/releases/mozilla-release/), which would eventaully become the exact Firefox hundreds of millions users are using everyday.

![Different Versions of Firefox]({{site.baseurl}}/assets/img/uploads/Life_Mozilla_II/firefox_version.png)
<figcaption><sub><sup>Different Versions of Firefox</sup></sub></figcaption>

Currently the frequency of releasing a new version of Firefox is on a monthly basis, and it's even longer on [Firefox Extended Support Release](https://www.mozilla.org/en-US/firefox/enterprise/) (ESR) version. That means the changes in "central" would be merged into "beta" after a month, and merging changes from "beta" to "release" as well. You can check the release schedule [here](https://wiki.mozilla.org/Release_Management/Calendar).

That’s what we would go through in our daily development, thank you for your reading and hope you enjoying!