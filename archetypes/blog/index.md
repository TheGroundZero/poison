---
title: "{{ replace .Name "-" " " | title }}"
linkTitle: "{{ replace .Name "-" " " | title }}"
summary: ""
author: ""
type: posts
publishdate: {{ .Date }}
lastmod: {{ .Date }}
comments: false
categories: []
tags: []
series: ""
params:
  images:
    - cover.png
hideToc: false
draft: true
---

# Intro

Lorum Ipsum

# Images

{{< figure
  src="zion-national-park.jpg"
  alt="A photograph of Zion National Park"
  title=""
  caption="Zion National Park"
  attr=""
  attrlink=""
  link="https://www.nps.gov/zion/index.htm"
  target="_blank"
  rel=""
  width=""
  height=""
  loading="lazy"
  class="ma0 w-75"
>}}

## Links

Hello [World][world]!

## Tabs

{{< tabs tabTotal="2" >}}

{{% tab tabName="First Tab" %}}
This is markdown content.
{{% /tab %}}

{{< tab tabName="Second Tab" >}}
{{< highlight text >}}
This is a code block.
{{< /highlight >}}
{{< /tab >}}

{{< /tabs >}}

## Mermaid diagrams

{{< mermaid >}}
sequenceDiagram
participant Alice
participant Bob
Alice->>John: Hello John, how are you?
loop Healthcheck
    John->>John: Fight against hypochondria
end
Note right of John: Rational thoughts <br>prevail!
John-->>Alice: Great!
John->>Bob: How about you?
Bob-->>John: Jolly good!
{{< /mermaid >}}

## PlantUML diagrams

{{< plantuml id="foo" >}}
a -> b
b -> c
{{< /plantuml >}}

## Details

{{< details summary="A detail dropdown" >}}
Markdown content
{{< /details >}}

## Webmention

{{< webmention
  type="reply"
  href="https://sequr.be/blog/2025/01/sending-my-first-webmention-from-scratch/"
  name="@dezestijn"
>}}
This is the content of the Webmention
{{< /webmention >}}


[world]: https://example.com "World"
