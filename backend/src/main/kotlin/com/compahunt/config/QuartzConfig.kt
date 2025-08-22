package com.compahunt.config

import org.quartz.spi.TriggerFiredBundle
import org.springframework.beans.factory.config.AutowireCapableBeanFactory
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.quartz.SpringBeanJobFactory

@Configuration
class QuartzConfig {

    @Bean
    fun springBeanJobFactory(autowireCapableBeanFactory: AutowireCapableBeanFactory): SpringBeanJobFactory {
        return object : SpringBeanJobFactory() {
            override fun createJobInstance(bundle: TriggerFiredBundle): Any {
                val job = super.createJobInstance(bundle)
                autowireCapableBeanFactory.autowireBean(job)
                return job
            }
        }
    }
}