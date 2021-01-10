---
date: 2020-12-26 05:50:17
layout: post
title: "Life as an engineer at Mozilla"
subtitle:
description:
image: /assets/img/uploads/firefox.jpeg
optimized_image:
category: life
tags:
  - life
  - tech
  - mozilla
paginate: false
---

I joined Mozilla in September 2014, and the six years have been. I quite enjoy working at Mozilla and building a product that hundreds of millions users use in their daily life. Although Firefox is not as popular as it was before in this competitive browser market, I am still proud of being one of the members of Mozilla who are (mostly) willing to make the internet more open and powerful. So today I would like to share some experience of what it's like being an engineer at Mozilla.

### Three Major Media Components
I work for media team, which is responsible for all the media related things on the web, and there are three major components in media, which are **Playback**, **WebAudio** and **WebRTC**.

**Playback** refers to playing media via [`<audio>`](https://mzl.la/2KBXG3B) or [`<video>`](https://mzl.la/34Mtxp7) tags. In this case, you have to assign a source to the element, which is typically a URL of a media file, or using [Media Source Extention API](https://mzl.la/3nRYyiO) to create a source and manually appending data into it. After downloading media data, it would be extracted from the media container, such as mp4 or webm, and goes through a decoding journey. Then a browser would need to handle different complex problems, from synchronizing audio and video to running some corresponding spec defined algorithms to expose those changes via various web APIs. Finally, giving the video data to the compositor that is responsible for drawing images on the screen, and feeding the audio data to the platform audio backend in order to play them, all of those processes are made to give users a pleasurable experience of watching media online. Most popular media websites all use this way to play their content, eg. Youtube, Netflix (that involves another technique called [Encrypted Media Extensions](https://mzl.la/2WOBqpA), but we won't talk about it here)

**WebAudio** is about using [Web Audio API](https://mzl.la/38Hckie) to establish a real-time audio graph that allows modular routing which provides the flexibility to create complex audio functions with dynamic effects. The basic audio operations are performed on the audio nodes and there are many different nodes availiable. Some of them can be used as input, from creating sound waves to capturing media from the media element, some can be used for creating effects, such as amplify the amplitude, filtering out certain frequency, and some can be used as output. This API is extremely useful for music production (you can create a synthesizer on the web!) and gaming.

**WebRTC** is being used whenever you have a real-time audio or video call with other people, it
establishes a peer-to-peer two-way connection network to allow the creation of a low-latency real-time communication. As we're all in this COVID era, the usage of WebRTC has increased dramistically during these time.

### Engaging in Web Standard Specifications
In our team, the media team, we manage issues related with those topics on our daily basic, and our jobs includes regular bug fixing, discussing and implementing various web standard specifications. Following web standard specifications is an important thing for us, because what we pursue is to have a standardized and open web that can be used for everyone fairly. We don't encourage people to build a product which can only run on certain browsers, having a consistent browsing experience across different web browsers is significant.

However, not all specifications are good for users, some of them might violate our belif which might cause security or privacy concerns. Mozilla evaluates those unimplemented specifications and considers them as different [important levels](https://mozilla.github.io/standards-positions/).

For specifications that have already been implemented, there might still be new feature requests coming in the future. If someone proposes a new feature, all browser vendors would start a discussion about it on the github where each specification belongs. If that proposal has positive feedback and gets enough browser vendors interest, then it would go through the process of being added into the specification. This is a small [example](https://bit.ly/38Cripn) where someone proposed to allowing `TextTrackCue.endTime=Infinity` represent an unspecified future time, which can be used for live streaming subtitles.

### Engaging in Open Source Projects
Yes, you may have already known that all the code we contribute to are open. Everyone are welcome to check our code and make any change to it (for sure, that should pass our code review and testing first ;) ) There are tons of projects in [Mozilla's github](https://github.com/mozilla), but the most important repository is the one for [Gecko](https://github.com/mozilla/gecko-dev) that is our core engine built inside Firefox to process almost everything while users is browsing websites. Our media components are just a small part of Gecko. Gecko has been a mega open source project since 1998 that has nearly [23M codes](https://www.openhub.net/p/firefox/analyses/latest/languages_summary) inside!

![Top 5 languages usage in Firefox]({{site.baseurl}}/assets/img/uploads/gecko_language_usage.png)
<figcaption><sub><sup>Top 5 languages usage in Firefox</sup></sub></figcaption>

With the exception of Firefox, there are still some gecko-based browsers in the wild, such as [WaterFox](https://www.waterfox.net/), [Tor](https://www.torproject.org/). By the way, don't forget that [ThunderBird](https://www.thunderbird.net/en-US/) is also built on Gecko!

Maintaining such a mega project is not an easy thing, so we have many useful tools to help us achieve that. In the next post, I will introduce our working flow and the tools we use.
