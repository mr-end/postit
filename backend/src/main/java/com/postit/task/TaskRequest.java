package com.postit.task;

import jakarta.validation.constraints.Size;

public class TaskRequest {

    @Size(max = 120)
    public String title;

    @Size(max = 2000)
    public String content;

    @Size(max = 32)
    public String color;

    public Integer posX;
    public Integer posY;
    public Boolean done;
}
