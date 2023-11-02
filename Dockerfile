FROM denoland/deno

EXPOSE 8000

WORKDIR /app 

ADD . /app

RUN deno cache src/main.ts

CMD ["deno", "run", "--allow-sys", "--allow-write", "--allow-net", "--allow-read", "--allow-env", "--unstable", "src/main.ts"]